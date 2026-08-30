import { NativeRouter, Env, RequestContext } from './router/router';
import { json, errorResponse } from './lib/response';
import { verifySessionToken, hashPassword, hasAllowedRole } from './lib/session';
import { AuthService } from './services/auth.service';
import { MemberService } from './services/member.service';
import { DashboardService } from './services/dashboard.service';
import { MemberRepository } from './repositories/member.repository';
import { MembershipRepository } from './repositories/membership.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { AttendanceRepository } from './repositories/attendance.repository';
import { PlanRepository } from './repositories/plan.repository';
import { UserRepository } from './repositories/user.repository';
import { AdminRepository } from './repositories/admin.repository';
import { NotificationService } from './lib/notifications';
import { EmailService } from './lib/email.service';
import { verifyTurnstileToken } from './lib/turnstile';
import {
  calculatePtCommission,
  calculateFreezeExtension,
  isCheckInBlocked,
  splitGstInclusiveAmount,
  isWithinLicenseLimit,
} from './lib/calculations';
import {
  LoginRequestSchema,
  MemberLoginRequestSchema,
  CreateMemberRequestSchema,
  UpdateMemberRequestSchema,
  RenewMembershipRequestSchema,
  RecordPaymentRequestSchema,
  CheckInRequestSchema,
  CreatePlanRequestSchema,
  CreateStaffRequestSchema,
  CreateGymRequestSchema,
  ToggleGymStatusRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  BulkImportMembersRequestSchema,
  FreezeMemberRequestSchema,
  RecordPtCollectionRequestSchema,
  SettlePtCommissionRequestSchema,
  NotificationSettingsRequestSchema,
  TestSmtpRequestSchema,
} from '@gymtech/shared';
import type { NotificationSettingsResponse } from '@gymtech/shared';

const router = new NativeRouter();

// ==========================================
// AUTH MIDDLEWARE
// ==========================================

async function requireAuth(req: Request, ctx: RequestContext): Promise<Response | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header', 401);
  }

  const token = authHeader.substring(7);
  const session = await verifySessionToken(token, ctx.env.JWT_SECRET);
  if (!session) {
    return errorResponse('Invalid or expired session token', 401);
  }

  ctx.user = session;
  ctx.gymId = session.gymId || undefined;
  return null;
}

async function requireGymContext(req: Request, ctx: RequestContext): Promise<Response | null> {
  const authErr = await requireAuth(req, ctx);
  if (authErr) return authErr;

  if (!ctx.gymId) {
    return errorResponse('User is not assigned to a gym tenant', 403);
  }
  return null;
}

async function requireSuperAdmin(req: Request, ctx: RequestContext): Promise<Response | null> {
  const authErr = await requireAuth(req, ctx);
  if (authErr) return authErr;

  if (ctx.user?.role !== 'SUPER_ADMIN') {
    return errorResponse('Platform Super Admin privileges required', 403);
  }
  return null;
}

// Restricts an endpoint to specific staff roles within the gym tenant.
async function requireRoles(req: Request, ctx: RequestContext, roles: string[]): Promise<Response | null> {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  if (!hasAllowedRole(ctx.user?.role, roles)) {
    return errorResponse('You do not have permission to perform this action', 403);
  }
  return null;
}

// ==========================================
// HEALTH & GENERAL
// ==========================================

router.get('/', () => json({ name: 'Gym SaaS API', status: 'online', runtime: 'Cloudflare Workers' }));
router.get('/api/health', () => json({ status: 'ok', service: 'gym-saas-api' }));

// ==========================================
// AUTH ROUTES
// ==========================================

router.post('/api/auth/login', async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const parseResult = LoginRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid credentials payload', 400);
  }

  // Cloudflare Turnstile Bot Verification
  if (parseResult.data.turnstileToken) {
    const ip = req.headers.get('cf-connecting-ip') || undefined;
    const turnstileRes = await verifyTurnstileToken(parseResult.data.turnstileToken, ctx.env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstileRes.success) {
      return errorResponse(turnstileRes.error || 'Bot verification failed', 403);
    }
  }

  const authService = new AuthService(ctx.env.DB, ctx.env.JWT_SECRET);
  const res = await authService.login(parseResult.data.email, parseResult.data.password);
  return json(res);
});

router.post('/api/auth/member-login', async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const parseResult = MemberLoginRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid login details', 400);
  }

  // Cloudflare Turnstile Bot Verification
  if (parseResult.data.turnstileToken) {
    const ip = req.headers.get('cf-connecting-ip') || undefined;
    const turnstileRes = await verifyTurnstileToken(parseResult.data.turnstileToken, ctx.env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstileRes.success) {
      return errorResponse(turnstileRes.error || 'Bot verification failed', 403);
    }
  }

  const cleanIdent = parseResult.data.identifier.trim();
  const cleanCode = parseResult.data.codeOrPin.trim();

  // Search by member_code, phone, or email
  const member: any = await ctx.env.DB.prepare(`
    SELECT m.*, g.name as gym_name, g.slug as gym_slug
    FROM members m
    JOIN gyms g ON g.id = m.gym_id
    WHERE (m.member_code = ? OR m.phone = ? OR m.email = ? OR m.phone = ?)
      AND m.deleted_at IS NULL
    LIMIT 1
  `).bind(cleanIdent, cleanIdent, cleanIdent, cleanIdent.replace(/\D/g, '')).first();

  if (!member) {
    return errorResponse('No member account found with this phone number or member code', 404);
  }

  // Verification: member code matches or phone suffix or code matches
  const memberCodeMatches = member.member_code.toUpperCase() === cleanCode.toUpperCase();
  const phoneMatches = member.phone.endsWith(cleanCode) || member.phone === cleanCode;
  const identMatchesCode = member.member_code.toUpperCase() === cleanIdent.toUpperCase();

  if (!memberCodeMatches && !phoneMatches && !identMatchesCode) {
    return errorResponse('Invalid verification credential. Please enter your Member Code or registered mobile number.', 401);
  }

  // Find active or latest membership
  const activeMembership: any = await ctx.env.DB.prepare(`
    SELECT ms.*, mp.name as plan_name
    FROM memberships ms
    LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
    WHERE ms.member_id = ? AND ms.gym_id = ?
    ORDER BY ms.end_date DESC
    LIMIT 1
  `).bind(member.id, member.gym_id).first();

  // Sign JWT session with role MEMBER
  const authService = new AuthService(ctx.env.DB, ctx.env.JWT_SECRET);
  const token = await authService.signMemberToken({
    id: member.id,
    gymId: member.gym_id,
    memberCode: member.member_code,
    phone: member.phone,
    name: `${member.first_name} ${member.last_name || ''}`.trim(),
  });

  return json({
    token,
    member,
    activeMembership: activeMembership || null,
    gym: {
      id: member.gym_id,
      name: member.gym_name,
      slug: member.gym_slug,
    },
  });
});

router.get('/api/member/portal', async (req, ctx) => {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return errorResponse('Unauthorized: Member token required', 401);

  const authService = new AuthService(ctx.env.DB, ctx.env.JWT_SECRET);
  const session = await authService.verifyToken(token);
  if (!session || !session.userId) {
    return errorResponse('Invalid or expired member session', 401);
  }

  // Fetch complete member profile, active membership, payments, and attendance
  const member: any = await ctx.env.DB.prepare(`
    SELECT m.*, g.name as gym_name, g.address as gym_address, g.phone as gym_phone
    FROM members m
    JOIN gyms g ON g.id = m.gym_id
    WHERE m.id = ? AND m.deleted_at IS NULL
  `).bind(session.userId).first();

  if (!member) {
    return errorResponse('Member record not found', 404);
  }

  const [memberships, payments, attendance] = await Promise.all([
    ctx.env.DB.prepare(`
      SELECT ms.*, mp.name as plan_name, mp.duration_months
      FROM memberships ms
      LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
      WHERE ms.member_id = ?
      ORDER BY ms.end_date DESC
    `).bind(member.id).all(),
    ctx.env.DB.prepare(`
      SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC LIMIT 20
    `).bind(member.id).all(),
    ctx.env.DB.prepare(`
      SELECT * FROM attendance WHERE member_id = ? ORDER BY check_in_time DESC LIMIT 30
    `).bind(member.id).all(),
  ]);

  const activeMembership = (memberships.results || []).find((m: any) => m.status === 'ACTIVE') || (memberships.results || [])[0] || null;

  return json({
    member,
    activeMembership,
    memberships: memberships.results || [],
    payments: payments.results || [],
    attendance: attendance.results || [],
    gym: {
      name: member.gym_name,
      address: member.gym_address,
      phone: member.gym_phone,
    },
  });
});

router.get('/api/auth/me', async (req, ctx) => {
  const authErr = await requireAuth(req, ctx);
  if (authErr) return authErr;

  const authService = new AuthService(ctx.env.DB, ctx.env.JWT_SECRET);
  const res = await authService.getCurrentUser(ctx.user!);
  return json(res);
});

router.post('/api/auth/forgot-password', async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const parseResult = ForgotPasswordRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid email address', 400);
  }

  const email = parseResult.data.email.toLowerCase().trim();
  const user = await ctx.env.DB
    .prepare('SELECT id, name, email FROM users WHERE LOWER(email) = ? AND deleted_at IS NULL')
    .bind(email)
    .first<{ id: string; name: string; email: string }>();

  if (!user) {
    // Return friendly generic message to prevent email enumeration
    return json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    });
  }

  // Generate secure reset token
  const token = `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
  const resetId = `pr_${crypto.randomUUID().slice(0, 8)}`;

  // Ensure password_resets table exists
  await ctx.env.DB.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
    CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
  `).catch(() => {});

  // Store in database with 1-hour expiration
  await ctx.env.DB
    .prepare(`
      INSERT INTO password_resets (id, user_id, email, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, unixepoch() + 3600, unixepoch())
    `)
    .bind(resetId, user.id, user.email, token)
    .run();

  const emailService = new EmailService(ctx.env);
  const sendResult = await emailService.sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    token,
  });

  return json({
    success: true,
    message: 'A password reset link has been sent to your email address.',
    devResetUrl: sendResult.resetUrl,
  });
});

router.post('/api/auth/reset-password', async (req, ctx) => {
  const body = await req.json().catch(() => ({}));
  const parseResult = ResetPasswordRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid password reset payload', 400);
  }

  const { token, newPassword } = parseResult.data;
  
  // Ensure password_resets table exists
  await ctx.env.DB.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `).catch(() => {});

  // Validate reset token
  const resetRecord = await ctx.env.DB
    .prepare(`
      SELECT * FROM password_resets 
      WHERE token = ? AND used_at IS NULL AND expires_at > unixepoch()
    `)
    .bind(token)
    .first<{ id: string; user_id: string; email: string }>();

  if (!resetRecord) {
    return errorResponse('Reset link is invalid or has expired. Please request a new link.', 400);
  }

  const user = await ctx.env.DB
    .prepare('SELECT id, name, email FROM users WHERE id = ? AND deleted_at IS NULL')
    .bind(resetRecord.user_id)
    .first<{ id: string; name: string; email: string }>();

  if (!user) {
    return errorResponse('Associated user account was not found', 404);
  }

  // Hash new password and update user
  const passwordHash = await hashPassword(newPassword);

  await ctx.env.DB.batch([
    ctx.env.DB
      .prepare('UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(passwordHash, user.id),
    ctx.env.DB
      .prepare('UPDATE password_resets SET used_at = unixepoch() WHERE id = ?')
      .bind(resetRecord.id),
  ]);

  const emailService = new EmailService(ctx.env);
  await emailService.sendPasswordResetConfirmation({
    to: user.email,
    name: user.name,
  });

  return json({
    success: true,
    message: 'Your password has been successfully reset. You can now sign in with your new credentials.',
  });
});

// ==========================================
// DASHBOARD
// ==========================================

router.get('/api/dashboard', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const dashboardService = new DashboardService(ctx.env.DB, ctx.gymId!);
  const metrics = await dashboardService.getMetrics();
  return json(metrics);
});

// ==========================================
// MEMBERS
// ==========================================

router.get('/api/members', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const search = ctx.query.get('search') || undefined;
  const status = ctx.query.get('status') || undefined;
  const limit = parseInt(ctx.query.get('limit') || '100', 10);
  const offset = parseInt(ctx.query.get('offset') || '0', 10);

  const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
  const members = await memberRepo.list({ search, status, limit, offset });
  return json({ members });
});

router.post('/api/members', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = CreateMemberRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid member data', 400);
  }

  const memberService = new MemberService(ctx.env.DB, ctx.gymId!, ctx.user!.id);
  const result = await memberService.createMemberWithPlan(parseResult.data);

  // Send automated welcome email if email provided
  if (parseResult.data.email) {
    try {
      const gym = await ctx.env.DB
        .prepare('SELECT name FROM gyms WHERE id = ?')
        .bind(ctx.gymId!)
        .first<{ name: string }>();
      const emailService = new EmailService(ctx.env);
      await emailService.sendWelcomeEmail({
        to: parseResult.data.email,
        name: `${result.member.first_name} ${result.member.last_name || ''}`.trim(),
        gymName: gym?.name || 'GymTech',
        memberCode: result.member.member_code,
        planName: result.membership?.membership_plan_id || 'Active Membership',
      });
    } catch (e: any) {
      console.warn('Failed to send automated welcome email:', e.message);
    }
  }

  return json(result, 201);
});

router.post('/api/members/bulk-import', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = BulkImportMembersRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid bulk migration payload', 400);
  }

  const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
  const result = await memberRepo.bulkCreateMembers(
    parseResult.data.members,
    ctx.user!.id,
    parseResult.data.defaultPlanId
  );

  return json({
    success: true,
    totalProcessed: parseResult.data.members.length,
    importedCount: result.importedCount,
    skippedCount: result.skippedCount,
    errors: result.errors,
  }, 201);
});

router.get('/api/members/:id', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const memberService = new MemberService(ctx.env.DB, ctx.gymId!, ctx.user!.id);
  const result = await memberService.getMemberDetails(ctx.params.id);
  return json(result);
});

router.put('/api/members/:id', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = UpdateMemberRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid update payload', 400);
  }

  const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
  await memberRepo.update(ctx.params.id, parseResult.data as any);
  const updated = await memberRepo.findById(ctx.params.id);
  return json(updated);
});

router.post('/api/members/:id/renew', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = RenewMembershipRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid renewal payload', 400);
  }

  const memberService = new MemberService(ctx.env.DB, ctx.gymId!, ctx.user!.id);
  const result = await memberService.renewMembership({
    memberId: ctx.params.id,
    ...parseResult.data,
  });
  return json(result);
});

// ==========================================
// FREEZE / PAUSE MEMBERSHIP
// ==========================================

router.post('/api/members/:id/freeze', async (req, ctx) => {
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = FreezeMemberRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid freeze payload', 400);
  }

  const member: any = await ctx.env.DB.prepare(
    'SELECT * FROM members WHERE id = ? AND gym_id = ? AND deleted_at IS NULL'
  ).bind(ctx.params.id, ctx.gymId!).first();

  if (!member) return errorResponse('Member not found', 404);
  if (member.status === 'FROZEN') return errorResponse('Membership is already frozen', 409);
  if (member.status === 'CANCELLED') return errorResponse('Cancelled memberships cannot be frozen', 409);

  const nowSec = Math.floor(Date.now() / 1000);
  const activeMs: any = await ctx.env.DB.prepare(`
    SELECT * FROM memberships
    WHERE member_id = ? AND gym_id = ? AND status = 'ACTIVE' AND end_date > ?
    ORDER BY end_date DESC LIMIT 1
  `).bind(member.id, ctx.gymId!, nowSec).first();

  if (!activeMs) {
    return errorResponse('Only members with an active membership can be frozen', 409);
  }

  await ctx.env.DB.batch([
    ctx.env.DB.prepare(
      "UPDATE members SET status = 'FROZEN', updated_at = unixepoch() WHERE id = ? AND gym_id = ?"
    ).bind(member.id, ctx.gymId!),
    ctx.env.DB.prepare(
      "UPDATE memberships SET status = 'FROZEN', frozen_at = ?, updated_at = unixepoch() WHERE id = ? AND gym_id = ?"
    ).bind(nowSec, activeMs.id, ctx.gymId!),
  ]);

  return json({
    success: true,
    status: 'FROZEN',
    membershipId: activeMs.id,
    message: `Membership paused. Remaining days are preserved and will be restored on reactivation.`,
  });
});

router.post('/api/members/:id/unfreeze', async (req, ctx) => {
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const member: any = await ctx.env.DB.prepare(
    'SELECT * FROM members WHERE id = ? AND gym_id = ? AND deleted_at IS NULL'
  ).bind(ctx.params.id, ctx.gymId!).first();

  if (!member) return errorResponse('Member not found', 404);
  if (member.status !== 'FROZEN') return errorResponse('Membership is not currently frozen', 409);

  const nowSec = Math.floor(Date.now() / 1000);
  const frozenMs: any = await ctx.env.DB.prepare(`
    SELECT * FROM memberships
    WHERE member_id = ? AND gym_id = ? AND status = 'FROZEN'
    ORDER BY end_date DESC LIMIT 1
  `).bind(member.id, ctx.gymId!).first();

  let extendedTo: number | null = null;
  if (frozenMs) {
    // Extend expiry by the exact frozen duration so paid days are never lost
    const { extendedTo: newEndDate } = calculateFreezeExtension(
      frozenMs.end_date,
      frozenMs.frozen_at || nowSec,
      nowSec
    );
    extendedTo = newEndDate;
    await ctx.env.DB.prepare(`
      UPDATE memberships SET status = 'ACTIVE', end_date = ?, frozen_at = NULL, updated_at = unixepoch()
      WHERE id = ? AND gym_id = ?
    `).bind(extendedTo, frozenMs.id, ctx.gymId!).run();
  }

  await ctx.env.DB.prepare(
    "UPDATE members SET status = 'ACTIVE', updated_at = unixepoch() WHERE id = ? AND gym_id = ?"
  ).bind(member.id, ctx.gymId!).run();

  return json({
    success: true,
    status: 'ACTIVE',
    membershipId: frozenMs?.id || null,
    extendedTo,
    message: extendedTo
      ? `Membership reactivated. New expiry: ${new Date(extendedTo * 1000).toLocaleDateString('en-IN')}.`
      : 'Member reactivated.',
  });
});

// ==========================================
// PLANS
// ==========================================

router.get('/api/plans', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
  const plans = await planRepo.listAll();
  return json({ plans });
});

router.post('/api/plans', async (req, ctx) => {
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = CreatePlanRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid plan payload', 400);
  }

  const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
  const planId = `mpl_${crypto.randomUUID().slice(0, 8)}`;
  await planRepo.create({
    id: planId,
    name: parseResult.data.name,
    description: parseResult.data.description,
    duration_months: parseResult.data.durationMonths,
    price: parseResult.data.price * 100, // store in paise
    admission_fee: parseResult.data.admissionFee * 100,
  });

  const created = await planRepo.findById(planId);
  return json(created, 201);
});

// ==========================================
// PAYMENTS
// ==========================================

router.get('/api/payments', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const limit = parseInt(ctx.query.get('limit') || '100', 10);
  const memberId = ctx.query.get('memberId') || undefined;

  const paymentRepo = new PaymentRepository(ctx.env.DB, ctx.gymId!);
  const [payments, summary] = await Promise.all([
    paymentRepo.list({ limit, memberId }),
    paymentRepo.getSummaryMetrics(),
  ]);

  return json({ payments, summary });
});

router.post('/api/payments', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = RecordPaymentRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid payment payload', 400);
  }

  const paymentRepo = new PaymentRepository(ctx.env.DB, ctx.gymId!);
  const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
  const member = await memberRepo.findById(parseResult.data.memberId);
  if (!member) {
    return errorResponse('Member not found', 404);
  }

  const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;
  const receiptNumber = await paymentRepo.getNextReceiptNumber();
  const paymentTimestamp = parseResult.data.paymentDate
    ? Math.floor(new Date(parseResult.data.paymentDate).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  const amountPaise = parseResult.data.amount * 100;

  await paymentRepo.record({
    id: paymentId,
    member_id: parseResult.data.memberId,
    membership_id: parseResult.data.membershipId || null,
    receipt_number: receiptNumber,
    amount: amountPaise,
    payment_date: paymentTimestamp,
    payment_mode: parseResult.data.paymentMode,
    reference_id: parseResult.data.referenceId || null,
    recorded_by_user_id: ctx.user!.id,
    notes: parseResult.data.notes || null,
  });

  // Keep membership paid/due amounts in sync with this payment
  if (parseResult.data.membershipId) {
    const membershipRepo = new MembershipRepository(ctx.env.DB, ctx.gymId!);
    await membershipRepo.updatePaymentProgress(parseResult.data.membershipId, amountPaise);
  }

  const notif = new NotificationService('Our Gym');
  const whatsappUrl = notif.generateWhatsAppUrl({
    recipientPhone: member.phone,
    recipientName: `${member.first_name} ${member.last_name || ''}`.trim(),
    type: 'PAYMENT_RECEIPT',
    params: {
      amount: parseResult.data.amount,
      paymentMode: parseResult.data.paymentMode,
      receiptNumber,
    },
  });

  return json({ paymentId, receiptNumber, whatsappUrl }, 201);
});

// GST-compliant invoice payload for a recorded payment
router.get('/api/payments/:id/invoice', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const payment: any = await ctx.env.DB.prepare(`
    SELECT p.*, m.first_name, m.last_name, m.phone as member_phone, m.member_code,
           mp.name as plan_name, mp.tax_percentage as plan_tax_percentage
    FROM payments p
    JOIN members m ON m.id = p.member_id
    LEFT JOIN memberships ms ON ms.id = p.membership_id
    LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
    WHERE p.id = ? AND p.gym_id = ?
  `).bind(ctx.params.id, ctx.gymId!).first();

  if (!payment) return errorResponse('Payment not found', 404);

  const gym: any = await ctx.env.DB.prepare(
    'SELECT name, address, city, state, pincode, phone, email, gst_number FROM gyms WHERE id = ?'
  ).bind(ctx.gymId!).first();

  // GST structure: amounts are stored tax-inclusive. Split into taxable + CGST/SGST.
  const taxPercentage = Number(payment.plan_tax_percentage || 0);
  const { taxableAmount, taxAmount, cgst, sgst } = splitGstInclusiveAmount(payment.amount, taxPercentage);

  return json({
    receiptNumber: payment.receipt_number,
    paymentDate: payment.payment_date,
    paymentMode: payment.payment_mode,
    referenceId: payment.reference_id,
    status: payment.status,
    gym: {
      name: gym?.name || '',
      address: gym?.address,
      city: gym?.city,
      state: gym?.state,
      pincode: gym?.pincode,
      phone: gym?.phone,
      email: gym?.email,
      gstNumber: gym?.gst_number,
    },
    member: {
      name: `${payment.first_name} ${payment.last_name || ''}`.trim(),
      memberCode: payment.member_code,
      phone: payment.member_phone,
    },
    planName: payment.plan_name || null,
    sacCode: '999723',
    amount: payment.amount,
    taxPercentage,
    taxableAmount,
    taxAmount,
    cgst: Math.round(taxAmount / 2),
    sgst: taxAmount - Math.round(taxAmount / 2),
    notes: payment.notes,
  });
});

// ==========================================
// ATTENDANCE
// ==========================================

router.get('/api/attendance', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const attendanceRepo = new AttendanceRepository(ctx.env.DB, ctx.gymId!);
  const logs = await attendanceRepo.listToday();
  return json({ logs });
});

router.post('/api/attendance/check-in', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = CheckInRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid check-in payload', 400);
  }

  const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
  const member =
    (await memberRepo.findById(parseResult.data.memberIdOrCode)) ||
    (await memberRepo.findByIdentifier(parseResult.data.memberIdOrCode));

  if (!member) {
    return errorResponse('No matching member found with this code or phone', 404);
  }

  // Enforce Membership Validity & Auto-Freeze Expiry
  const activeMembership: any = await ctx.env.DB.prepare(`
    SELECT ms.*, mp.name as plan_name
    FROM memberships ms
    LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
    WHERE ms.member_id = ? AND ms.gym_id = ?
    ORDER BY ms.end_date DESC
    LIMIT 1
  `).bind(member.id, ctx.gymId!).first();

  const nowSec = Math.floor(Date.now() / 1000);
  const blocked = isCheckInBlocked({
    memberStatus: member.status,
    membershipEndDate: activeMembership ? activeMembership.end_date : null,
    membershipStatus: activeMembership ? activeMembership.status : null,
    nowSec,
  });

  if (blocked) {
    // Auto-freeze member and membership in database if not already updated
    if (member.status === 'ACTIVE') {
      await ctx.env.DB.prepare(`
        UPDATE members SET status = 'EXPIRED', updated_at = unixepoch() WHERE id = ?
      `).bind(member.id).run();
      if (activeMembership && activeMembership.status === 'ACTIVE') {
        await ctx.env.DB.prepare(`
          UPDATE memberships SET status = 'EXPIRED', updated_at = unixepoch() WHERE id = ?
        `).bind(activeMembership.id).run();
      }
    }

    const expiryDateStr = activeMembership
      ? new Date(activeMembership.end_date * 1000).toLocaleDateString('en-IN')
      : 'No Plan';

    return json(
      {
        success: false,
        code: 'MEMBERSHIP_EXPIRED',
        error: `ACCESS DENIED: Membership expired on ${expiryDateStr}. Account is frozen until renewed.`,
        member: {
          id: member.id,
          name: `${member.first_name} ${member.last_name || ''}`.trim(),
          memberCode: member.member_code,
          phone: member.phone,
          status: 'EXPIRED',
          expiryDate: expiryDateStr,
        },
      },
      403
    );
  }

  const attendanceRepo = new AttendanceRepository(ctx.env.DB, ctx.gymId!);
  const checkInId = `att_${crypto.randomUUID().slice(0, 8)}`;
  const res = await attendanceRepo.checkIn({
    id: checkInId,
    member_id: member.id,
    method: parseResult.data.method,
    recorded_by_user_id: ctx.user!.id,
  });

  return json({
    success: true,
    alreadyCheckedIn: res.alreadyCheckedIn,
    member: {
      id: member.id,
      name: `${member.first_name} ${member.last_name || ''}`.trim(),
      memberCode: member.member_code,
      phone: member.phone,
      status: member.status,
    },
  });
});

// ==========================================
// STAFF
// ==========================================

router.get('/api/staff', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const userRepo = new UserRepository(ctx.env.DB);
  const staff = await userRepo.listGymStaff(ctx.gymId!);
  return json({ staff });
});

router.post('/api/staff', async (req, ctx) => {
  // Only owners/managers may create new staff accounts (prevents privilege escalation by front-desk/trainer roles)
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = CreateStaffRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid staff payload', 400);
  }

  const userRepo = new UserRepository(ctx.env.DB);
  const existing = await userRepo.findByEmail(parseResult.data.email);
  if (existing) {
    return errorResponse('A user with this email address already exists', 409);
  }

  // Enforce Commercial License Staff Limit (e.g. up to 3 staff on Starter plan)
  const license = await ctx.env.DB
    .prepare('SELECT max_staff FROM licenses WHERE gym_id = ? AND status = "ACTIVE"')
    .bind(ctx.gymId!)
    .first<{ max_staff: number }>();

  if (license && license.max_staff > 0) {
    const existingStaff = await userRepo.listGymStaff(ctx.gymId!);
    if (!isWithinLicenseLimit(existingStaff.length, license.max_staff)) {
      return errorResponse(
        `Commercial plan limit reached (maximum ${license.max_staff} staff accounts). Please upgrade your platform subscription to add more staff.`,
        403
      );
    }
  }

  const userId = `usr_${crypto.randomUUID().slice(0, 8)}`;
  const passwordHash = await hashPassword(parseResult.data.password);

  await userRepo.create({
    id: userId,
    gym_id: ctx.gymId!,
    name: parseResult.data.name,
    email: parseResult.data.email,
    phone: parseResult.data.phone,
    password_hash: passwordHash,
    role: parseResult.data.role,
  });

  const created = await userRepo.findById(userId);
  return json(created, 201);
});

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsResponse = {
  reminderDays: 7,
  welcomeEnabled: true,
  receiptEnabled: true,
  expiryEnabled: true,
};

router.get('/api/settings/notifications', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const gym = await ctx.env.DB
    .prepare('SELECT notification_settings_json FROM gyms WHERE id = ?')
    .bind(ctx.gymId!)
    .first<{ notification_settings_json: string | null }>();

  const saved = gym?.notification_settings_json ? JSON.parse(gym.notification_settings_json) : {};
  return json({ ...DEFAULT_NOTIFICATION_SETTINGS, ...saved });
});

router.put('/api/settings/notifications', async (req, ctx) => {
  // Notification preferences affect billing/communication for the whole gym; restrict to owners/managers
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = NotificationSettingsRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid notification settings payload', 400);
  }

  await ctx.env.DB
    .prepare('UPDATE gyms SET notification_settings_json = ?, updated_at = unixepoch() WHERE id = ?')
    .bind(JSON.stringify(parseResult.data), ctx.gymId!)
    .run();

  return json(parseResult.data);
});

router.post('/api/settings/smtp/test', async (req, ctx) => {
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = TestSmtpRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid SMTP test payload', 400);
  }

  const { smtp, testRecipient } = parseResult.data;

  // Retrieve gym info for branding
  const gym = await ctx.env.DB
    .prepare('SELECT name FROM gyms WHERE id = ?')
    .bind(ctx.gymId!)
    .first<{ name: string }>();

  const emailService = new EmailService(ctx.env);
  const result = await emailService.sendTestSmtpEmail({
    to: testRecipient,
    gymName: gym?.name || 'Your Gym',
    smtpHost: smtp.host || 'smtp.custom-relay.net',
    smtpPort: smtp.port || 587,
    provider: smtp.provider,
  });

  return json(result);
});

// ==========================================
// PT COLLECTIONS & COMMISSIONS
// ==========================================

router.get('/api/pt/collections', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  // Trainers can only ever see their own PT collections, regardless of the trainerId query param
  const trainerId = ctx.user!.role === 'TRAINER' ? ctx.user!.id : ctx.query.get('trainerId') || undefined;
  const limit = Math.min(parseInt(ctx.query.get('limit') || '100', 10), 500);

  let sql = `
    SELECT pt.*, 
           m.first_name || ' ' || COALESCE(m.last_name, '') as member_name, m.member_code,
           u.name as trainer_name
    FROM pt_collections pt
    JOIN members m ON m.id = pt.member_id
    LEFT JOIN users u ON u.id = pt.trainer_id
    WHERE pt.gym_id = ?
  `;
  const binds: any[] = [ctx.gymId!];
  if (trainerId) {
    sql += ' AND pt.trainer_id = ?';
    binds.push(trainerId);
  }
  sql += ' ORDER BY pt.payment_date DESC LIMIT ?';
  binds.push(limit);

  const rows = await ctx.env.DB.prepare(sql).bind(...binds).all();
  return json({ collections: rows.results || [] });
});

router.get('/api/pt/summary', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  // Trainers may only see their own commission totals, not the earnings of other trainers
  const isTrainer = ctx.user!.role === 'TRAINER';
  const totalsSql = isTrainer
    ? `SELECT 
         COALESCE(SUM(amount), 0) as total_collected,
         COALESCE(SUM(CASE WHEN commission_status = 'PENDING' THEN commission_amount END), 0) as commission_pending,
         COALESCE(SUM(CASE WHEN commission_status = 'PAID' THEN commission_amount END), 0) as commission_paid
       FROM pt_collections WHERE gym_id = ? AND trainer_id = ?`
    : `SELECT 
         COALESCE(SUM(amount), 0) as total_collected,
         COALESCE(SUM(CASE WHEN commission_status = 'PENDING' THEN commission_amount END), 0) as commission_pending,
         COALESCE(SUM(CASE WHEN commission_status = 'PAID' THEN commission_amount END), 0) as commission_paid
       FROM pt_collections WHERE gym_id = ?`;
  const totalsStmt = isTrainer
    ? ctx.env.DB.prepare(totalsSql).bind(ctx.gymId!, ctx.user!.id)
    : ctx.env.DB.prepare(totalsSql).bind(ctx.gymId!);
  const totals: any = await totalsStmt.first();

  const byTrainerSql = `
    SELECT 
      pt.trainer_id,
      COALESCE(u.name, 'Unknown Trainer') as trainer_name,
      COUNT(*) as collections,
      COALESCE(SUM(pt.amount), 0) as collected,
      COALESCE(SUM(CASE WHEN pt.commission_status = 'PENDING' THEN pt.commission_amount END), 0) as commission_pending,
      COALESCE(SUM(CASE WHEN pt.commission_status = 'PAID' THEN pt.commission_amount END), 0) as commission_paid
    FROM pt_collections pt
    LEFT JOIN users u ON u.id = pt.trainer_id
    WHERE pt.gym_id = ?${isTrainer ? ' AND pt.trainer_id = ?' : ''}
    GROUP BY pt.trainer_id
    ORDER BY collected DESC
  `;
  const byTrainerStmt = isTrainer
    ? ctx.env.DB.prepare(byTrainerSql).bind(ctx.gymId!, ctx.user!.id)
    : ctx.env.DB.prepare(byTrainerSql).bind(ctx.gymId!);
  const byTrainer = await byTrainerStmt.all();

  return json({
    totalCollected: totals?.total_collected || 0,
    totalCommissionPending: totals?.commission_pending || 0,
    totalCommissionPaid: totals?.commission_paid || 0,
    byTrainer: byTrainer.results || [],
  });
});

router.post('/api/pt/collections', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = RecordPtCollectionRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid PT collection payload', 400);
  }

  const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
  const member = await memberRepo.findById(parseResult.data.memberId);
  if (!member) return errorResponse('Member not found', 404);

  // Trainers can only record collections against themselves, never on behalf of another trainer
  const trainerId = ctx.user!.role === 'TRAINER' ? ctx.user!.id : parseResult.data.trainerId;
  const trainer: any = await ctx.env.DB.prepare(
    "SELECT id, name FROM users WHERE id = ? AND gym_id = ? AND role IN ('TRAINER', 'OWNER', 'MANAGER') AND deleted_at IS NULL"
  ).bind(trainerId, ctx.gymId!).first();
  if (!trainer) return errorResponse('Trainer not found in this gym', 404);

  const amountPaise = Math.round(parseResult.data.amount * 100);
  const commissionAmount = calculatePtCommission(amountPaise, parseResult.data.commissionPercentage);
  const paymentTimestamp = parseResult.data.paymentDate
    ? Math.floor(new Date(parseResult.data.paymentDate).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  const paymentRepo = new PaymentRepository(ctx.env.DB, ctx.gymId!);
  const receiptNumber = await paymentRepo.getNextReceiptNumber();
  const id = `ptc_${crypto.randomUUID().slice(0, 8)}`;

  await ctx.env.DB.prepare(`
    INSERT INTO pt_collections (
      id, gym_id, member_id, trainer_id, sessions, amount,
      commission_percentage, commission_amount, commission_status,
      payment_mode, payment_date, receipt_number, notes, recorded_by_user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
  `).bind(
    id,
    ctx.gymId!,
    parseResult.data.memberId,
    trainerId,
    parseResult.data.sessions,
    amountPaise,
    parseResult.data.commissionPercentage,
    commissionAmount,
    parseResult.data.paymentMode,
    paymentTimestamp,
    receiptNumber,
    parseResult.data.notes || null,
    ctx.user!.id
  ).run();

  return json({ id, receiptNumber, commissionAmount }, 201);
});

router.post('/api/pt/collections/:id/settle', async (req, ctx) => {
  // Settling a commission payout is a financial control action restricted to owners/managers
  const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
  if (roleErr) return roleErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = SettlePtCommissionRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse('Invalid settlement payload', 400);
  }

  const existing: any = await ctx.env.DB.prepare(
    'SELECT id FROM pt_collections WHERE id = ? AND gym_id = ?'
  ).bind(ctx.params.id, ctx.gymId!).first();
  if (!existing) return errorResponse('PT collection not found', 404);

  await ctx.env.DB.prepare(
    'UPDATE pt_collections SET commission_status = ?, updated_at = unixepoch() WHERE id = ? AND gym_id = ?'
  ).bind(parseResult.data.status, ctx.params.id, ctx.gymId!).run();

  return json({ success: true, id: ctx.params.id, status: parseResult.data.status });
});

// ==========================================
// REPORTS
// ==========================================

router.get('/api/reports', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const period = (ctx.query.get('period') || 'month') as 'month' | 'quarter' | 'year';
  const now = new Date();
  const nowSec = Math.floor(now.getTime() / 1000);
  const periodStart =
    period === 'quarter'
      ? nowSec - 90 * 86400
      : period === 'year'
        ? Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000)
        : Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);

  const dashboardService = new DashboardService(ctx.env.DB, ctx.gymId!);
  const metrics = await dashboardService.getMetrics();

  const periodRevenueRes = await ctx.env.DB.prepare(`
    SELECT COALESCE(SUM(amount), 0) as revenue, COUNT(*) as payment_count
    FROM payments WHERE gym_id = ? AND status = 'COMPLETED' AND payment_date >= ?
  `).bind(ctx.gymId!, periodStart).first<{ revenue: number; payment_count: number }>();

  const planBreakdownRes = await ctx.env.DB.prepare(`
    SELECT mp.name, COUNT(DISTINCT m.id) as count, SUM(ms.final_amount) as revenue
    FROM membership_plans mp
    LEFT JOIN memberships ms ON ms.membership_plan_id = mp.id AND ms.gym_id = ? AND ms.start_date >= ?
    LEFT JOIN members m ON ms.member_id = m.id AND m.gym_id = ?
    WHERE mp.gym_id = ? AND mp.is_active = 1
    GROUP BY mp.id, mp.name
    ORDER BY revenue DESC
    LIMIT 8
  `)
    .bind(ctx.gymId, periodStart, ctx.gymId, ctx.gymId)
    .all();

  return json({
    metrics,
    period,
    periodRevenue: periodRevenueRes?.revenue || 0,
    periodPaymentCount: periodRevenueRes?.payment_count || 0,
    planBreakdown: planBreakdownRes.results || [],
  });
});

// CSV / Excel-compatible export of operational reports
router.get('/api/reports/export', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const type = ctx.query.get('type') || 'payments';
  const csvEscape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const toCsv = (headers: string[], rows: any[][]) =>
    [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');

  let csv = '';
  let filename = `${type}-report.csv`;

  if (type === 'payments') {
    const rows = await ctx.env.DB.prepare(`
      SELECT p.receipt_number, p.payment_date, m.first_name, m.last_name, m.member_code,
             p.amount, p.payment_mode, p.reference_id, p.status, u.name as recorded_by
      FROM payments p
      JOIN members m ON m.id = p.member_id
      LEFT JOIN users u ON u.id = p.recorded_by_user_id
      WHERE p.gym_id = ?
      ORDER BY p.payment_date DESC LIMIT 2000
    `).bind(ctx.gymId!).all();
    csv = toCsv(
      ['Receipt No', 'Date', 'Member', 'Member Code', 'Amount (INR)', 'Mode', 'Reference', 'Status', 'Recorded By'],
      (rows.results || []).map((r: any) => [
        r.receipt_number,
        new Date(r.payment_date * 1000).toLocaleDateString('en-IN'),
        `${r.first_name} ${r.last_name || ''}`.trim(),
        r.member_code,
        (r.amount / 100).toFixed(2),
        r.payment_mode,
        r.reference_id || '',
        r.status,
        r.recorded_by || '',
      ])
    );
  } else if (type === 'members') {
    const rows = await ctx.env.DB.prepare(`
      SELECT m.member_code, m.first_name, m.last_name, m.phone, m.email, m.status, m.joined_date,
             mp.name as plan_name, ms.end_date, ms.due_amount
      FROM members m
      LEFT JOIN memberships ms ON ms.member_id = m.id AND ms.gym_id = m.gym_id
      LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
      WHERE m.gym_id = ? AND m.deleted_at IS NULL
      GROUP BY m.id
      ORDER BY m.first_name ASC LIMIT 2000
    `).bind(ctx.gymId!).all();
    csv = toCsv(
      ['Member Code', 'First Name', 'Last Name', 'Phone', 'Email', 'Status', 'Joined', 'Plan', 'Expiry', 'Due (INR)'],
      (rows.results || []).map((r: any) => [
        r.member_code,
        r.first_name,
        r.last_name || '',
        r.phone,
        r.email || '',
        r.status,
        new Date(r.joined_date * 1000).toLocaleDateString('en-IN'),
        r.plan_name || '',
        r.end_date ? new Date(r.end_date * 1000).toLocaleDateString('en-IN') : '',
        ((r.due_amount || 0) / 100).toFixed(2),
      ])
    );
  } else if (type === 'attendance') {
    const rows = await ctx.env.DB.prepare(`
      SELECT a.date_key, a.check_in_time, a.method, m.first_name, m.last_name, m.member_code
      FROM attendance a
      JOIN members m ON m.id = a.member_id
      WHERE a.gym_id = ?
      ORDER BY a.check_in_time DESC LIMIT 5000
    `).bind(ctx.gymId!).all();
    csv = toCsv(
      ['Date', 'Check-in Time', 'Member', 'Member Code', 'Method'],
      (rows.results || []).map((r: any) => [
        r.date_key,
        new Date(r.check_in_time * 1000).toLocaleTimeString('en-IN'),
        `${r.first_name} ${r.last_name || ''}`.trim(),
        r.member_code,
        r.method,
      ])
    );
  } else if (type === 'dues') {
    const rows = await ctx.env.DB.prepare(`
      SELECT m.member_code, m.first_name, m.last_name, m.phone, mp.name as plan_name,
             ms.end_date, ms.final_amount, ms.paid_amount, ms.due_amount
      FROM memberships ms
      JOIN members m ON m.id = ms.member_id
      LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
      WHERE ms.gym_id = ? AND ms.due_amount > 0 AND m.deleted_at IS NULL
      ORDER BY ms.due_amount DESC LIMIT 2000
    `).bind(ctx.gymId!).all();
    csv = toCsv(
      ['Member Code', 'Member', 'Phone', 'Plan', 'Expiry', 'Final (INR)', 'Paid (INR)', 'Due (INR)'],
      (rows.results || []).map((r: any) => [
        r.member_code,
        `${r.first_name} ${r.last_name || ''}`.trim(),
        r.phone,
        r.plan_name || '',
        new Date(r.end_date * 1000).toLocaleDateString('en-IN'),
        (r.final_amount / 100).toFixed(2),
        (r.paid_amount / 100).toFixed(2),
        (r.due_amount / 100).toFixed(2),
      ])
    );
  } else {
    return errorResponse('Unknown export type. Use payments, members, attendance or dues.', 400);
  }

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
});

// ==========================================
// SUPER ADMIN (/admin)
// ==========================================

router.get('/api/admin/gyms', async (req, ctx) => {
  const adminErr = await requireSuperAdmin(req, ctx);
  if (adminErr) return adminErr;

  const adminRepo = new AdminRepository(ctx.env.DB);
  const gyms = await adminRepo.listGyms();
  return json({ gyms });
});

router.get('/api/admin/plans', async (req, ctx) => {
  const adminErr = await requireSuperAdmin(req, ctx);
  if (adminErr) return adminErr;

  const adminRepo = new AdminRepository(ctx.env.DB);
  const plans = await adminRepo.listPlans();
  return json({ plans });
});

router.get('/api/admin/metrics', async (req, ctx) => {
  const adminErr = await requireSuperAdmin(req, ctx);
  if (adminErr) return adminErr;

  const adminRepo = new AdminRepository(ctx.env.DB);
  const metrics = await adminRepo.getPlatformMetrics();
  return json(metrics);
});

router.post('/api/admin/gyms', async (req, ctx) => {
  const adminErr = await requireSuperAdmin(req, ctx);
  if (adminErr) return adminErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = CreateGymRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid gym data', 400);
  }

  const adminRepo = new AdminRepository(ctx.env.DB);
  const result = await adminRepo.createGymWithOwner({
    gymName: parseResult.data.gymName,
    slug: parseResult.data.slug,
    gymPhone: parseResult.data.gymPhone,
    city: parseResult.data.city,
    planId: parseResult.data.planId,
    ownerName: parseResult.data.ownerName,
    ownerEmail: parseResult.data.ownerEmail,
    ownerPhone: parseResult.data.ownerPhone,
    ownerPasswordPlain: parseResult.data.ownerPassword,
  });

  return json(result, 201);
});

router.post('/api/admin/gyms/:id/status', async (req, ctx) => {
  const adminErr = await requireSuperAdmin(req, ctx);
  if (adminErr) return adminErr;

  const body = await req.json().catch(() => ({}));
  const parseResult = ToggleGymStatusRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message || 'Invalid status payload', 400);
  }

  const adminRepo = new AdminRepository(ctx.env.DB);
  await adminRepo.toggleGymStatus(ctx.params.id, parseResult.data.status);
  return json({ success: true, gymId: ctx.params.id, status: parseResult.data.status });
});

// ==========================================
// MEDIA & R2 IMAGE STORAGE
// ==========================================

router.post('/api/v1/media/upload', async (req, ctx) => {
  const authErr = await requireGymContext(req, ctx);
  if (authErr) return authErr;

  try {
    const contentType = req.headers.get('Content-Type') || '';
    let fileBuffer: ArrayBuffer | null = null;
    let fileName = `image-${Date.now()}.jpg`;
    let fileMime = 'image/jpeg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return errorResponse('No file provided in form data', 400);
      }
      fileBuffer = await file.arrayBuffer();
      fileName = file.name || fileName;
      fileMime = file.type || fileMime;
    } else {
      fileBuffer = await req.arrayBuffer();
      fileMime = contentType || fileMime;
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return errorResponse('Empty file upload', 400);
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `${ctx.gymId}/${Date.now()}-${safeName}`;

    if (ctx.env.MEDIA_BUCKET) {
      await ctx.env.MEDIA_BUCKET.put(storageKey, fileBuffer, {
        httpMetadata: { contentType: fileMime },
        customMetadata: { gymId: ctx.gymId!, uploadedBy: ctx.user?.id || '' },
      });
    }

    const mediaUrl = `/api/v1/media/${storageKey}`;

    return json({
      success: true,
      storageKey,
      url: mediaUrl,
      fileName,
      mimeType: fileMime,
      sizeBytes: fileBuffer.byteLength,
    }, 201);
  } catch (err: any) {
    return errorResponse(`Image upload failed: ${err.message}`, 500);
  }
});

router.get('/api/v1/media/:gymId/:key', async (req, ctx) => {
  const fullKey = `${ctx.params.gymId}/${ctx.params.key}`;

  if (!ctx.env.MEDIA_BUCKET) {
    return errorResponse('R2 Object Storage is not configured in this environment', 503);
  }

  const object = await ctx.env.MEDIA_BUCKET.get(fullKey);
  if (!object) {
    return errorResponse('Media object not found', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
});

// ==========================================
// WORKER DEFAULT EXPORT
// ==========================================

export default {
  async fetch(req: Request, env: Env, executionCtx: ExecutionContext): Promise<Response> {
    return await router.handle(req, env, executionCtx);
  },
};
