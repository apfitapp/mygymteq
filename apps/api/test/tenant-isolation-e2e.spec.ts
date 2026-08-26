import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { signJwt } from '../src/lib/crypto';

const JWT_SECRET = 'gym-saas-dev-secret-super-secure-key-2026';

describe('Multi-Tenant & Security Router Tests', () => {
  it('verifies /api/health responds with 200 ok', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.status).toBe('ok');
    expect(body.service).toBe('mygymteq-api');
  });

  it('rejects unauthenticated requests to protected endpoints with 401', async () => {
    const res = await app.request('/api/auth/me');
    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
  });

  it('verifies 404 handler on non-existent route', async () => {
    const res = await app.request('/api/invalid-endpoint');
    expect(res.status).toBe(404);
  });

  it('blocks gym staff from accessing platform super admin endpoints (RBAC Guard)', async () => {
    const staffToken = await signJwt(
      {
        sub: 'usr_ironhouse_staff',
        email: 'staff@ironhouse.in',
        role: 'STAFF',
        gymId: 'gym_ironhouse',
        branchId: 'br_ironhouse_jh',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET
    );

    const res = await app.request('/api/platform/metrics', {
      headers: {
        Authorization: `Bearer ${staffToken}`,
      },
    }, {
      JWT_SECRET,
      ENVIRONMENT: 'test',
    });

    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error).toContain('Forbidden: Role \'STAFF\' is not authorized');
  });
});
