import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken } from './lib/auth/session';
import { getGymAndLicense } from './server/services/tenant.service';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Initialize locals defaults
  context.locals.user = null;
  context.locals.gym = null;
  context.locals.license = null;

  // 1. Bypass static assets and public pages
  if (
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname === '/login' ||
    pathname === '/logout' ||
    pathname === '/checkin' ||
    pathname === '/'
  ) {
    return next();
  }

  // 2. Read session cookie
  const token = context.cookies.get('gym_session')?.value;
  if (!token) {
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // 3. Verify JWT signature with secret from Cloudflare Workers runtime
  const secret = context.locals.runtime?.env?.JWT_SECRET || 'gym-saas-jwt-super-secret-production-key-2026';
  const userPayload = await verifySessionToken(token, secret);

  if (!userPayload) {
    context.cookies.delete('gym_session', { path: '/' });
    return context.redirect('/login');
  }

  context.locals.user = {
    id: userPayload.id,
    email: userPayload.email,
    name: userPayload.name,
    role: userPayload.role,
    gymId: userPayload.gymId,
  };

  // 4. Platform Super Admin Route Guard
  if (pathname.startsWith('/admin')) {
    if (userPayload.role !== 'SUPER_ADMIN') {
      return new Response('Forbidden: Platform Super Admin access required', { status: 403 });
    }
    return next();
  }

  // If Super Admin accesses gym routes, route them to admin dashboard
  if (userPayload.role === 'SUPER_ADMIN') {
    return context.redirect('/admin');
  }

  // 5. Normal Tenant Guard & License Verification
  if (!userPayload.gymId) {
    return new Response('Unauthorized: Account is not linked to any Gym', { status: 403 });
  }

  const db = context.locals.runtime?.env?.DB;
  if (db) {
    const { gym, license } = await getGymAndLicense(db, userPayload.gymId);
    if (!gym) {
      context.cookies.delete('gym_session', { path: '/' });
      return context.redirect('/login');
    }

    if (gym.status === 'SUSPENDED') {
      return new Response('This Gym account is currently suspended. Please contact support.', { status: 403 });
    }

    context.locals.gym = gym;
    context.locals.license = license;
  }

  return next();
});
