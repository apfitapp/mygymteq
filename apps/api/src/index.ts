import { NativeRouter, Env, RequestContext } from './router/router';
import { json, errorResponse } from './lib/response';
import { verifySessionToken, hashPassword } from './lib/session';
import { AuthService } from './services/auth.service';
import { MemberService } from './services/member.service';
import { DashboardService } from './services/dashboard.service';
import { MemberRepository } from './repositories/member.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { AttendanceRepository } from './repositories/attendance.repository';
import { PlanRepository } from './repositories/plan.repository';
import { UserRepository } from './repositories/user.repository';
import { AdminRepository } from './repositories/admin.repository';
import { NotificationService } from './lib/notifications';
import {
  LoginRequestSchema,
  CreateMemberRequestSchema,
  UpdateMemberRequestSchema,
  RenewMembershipRequestSchema,
  RecordPaymentRequestSchema,
  CheckInRequestSchema,
  CreatePlanRequestSchema,
  CreateStaffRequestSchema,
  CreateGymRequestSchema,
  ToggleGymStatusRequestSchema,
} from '@gym/shared';

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

  const authService = new AuthService(ctx.env.DB, ctx.env.JWT_SECRET);
  const res = await authService.login(parseResult.data.email, parseResult.data.password);
  return json(res);
});

router.get('/api/auth/me', async (req, ctx) => {
  const authErr = await requireAuth(req, ctx);
  if (authErr) return authErr;

  const authService = new AuthService(ctx.env.DB, ctx.env.JWT_SECRET);
  const res = await authService.getCurrentUser(ctx.user!);
  return json(res);
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
  return json(result, 201);
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
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

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
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

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
// REPORTS
// ==========================================

router.get('/api/reports', async (req, ctx) => {
  const gymErr = await requireGymContext(req, ctx);
  if (gymErr) return gymErr;

  const dashboardService = new DashboardService(ctx.env.DB, ctx.gymId!);
  const metrics = await dashboardService.getMetrics();

  const planBreakdownRes = await ctx.env.DB.prepare(`
    SELECT mp.name, COUNT(DISTINCT m.id) as count, SUM(ms.final_amount) as revenue
    FROM membership_plans mp
    LEFT JOIN memberships ms ON ms.membership_plan_id = mp.id AND ms.gym_id = ?
    LEFT JOIN members m ON ms.member_id = m.id AND m.gym_id = ?
    WHERE mp.gym_id = ? AND mp.is_active = 1
    GROUP BY mp.id, mp.name
    ORDER BY revenue DESC
    LIMIT 8
  `)
    .bind(ctx.gymId, ctx.gymId, ctx.gymId)
    .all();

  return json({
    metrics,
    planBreakdown: planBreakdownRes.results || [],
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
// WORKER DEFAULT EXPORT
// ==========================================

export default {
  async fetch(req: Request, env: Env, executionCtx: ExecutionContext): Promise<Response> {
    return await router.handle(req, env, executionCtx);
  },
};
