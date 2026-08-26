import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Bindings, Variables } from './env';
import { getDb } from './db/client';
import { authRoutes } from './modules/auth.routes';
import { platformRoutes } from './modules/platform.routes';
import { gymRoutes } from './modules/gym.routes';
import { memberRoutes } from './modules/members.routes';
import { membershipRoutes } from './modules/memberships.routes';
import { paymentRoutes } from './modules/payments.routes';
import { attendanceRoutes } from './modules/attendance.routes';
import { dashboardRoutes } from './modules/dashboard.routes';
import { runMembershipExpiryJob } from './cron/expiry-check';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'x-gym-slug', 'x-gym-id', 'x-branch-id'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })
);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'mygymteq-api',
    time: new Date().toISOString(),
  });
});

// Domain Route Mounting
app.route('/api/auth', authRoutes);
app.route('/api/platform', platformRoutes);
app.route('/api/gym', gymRoutes);
app.route('/api/members', memberRoutes);
app.route('/api/memberships', membershipRoutes);
app.route('/api/payments', paymentRoutes);
app.route('/api/attendance', attendanceRoutes);
app.route('/api/dashboard', dashboardRoutes);

// 404 Handler
app.notFound((c) => {
  return c.json({ success: false, error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
});

// Central Error Handler
app.onError((err, c) => {
  console.error('[API ERROR]', err);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error',
  }, 500);
});

export { app };

// Cloudflare Workers Export (Fetch + Scheduled Cron)
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, _ctx: ExecutionContext) {
    const db = getDb(env.DB);
    const result = await runMembershipExpiryJob(db);
    console.log(`[CRON] Midnight expiry check completed. Expired ${result.expiredCount} memberships.`);
  },
};
