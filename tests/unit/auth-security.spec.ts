import { describe, it, expect } from 'vitest';
import { hashPassword, createSessionToken, verifySessionToken } from '../../apps/api/src/lib/session';

describe('Auth & Cryptographic Security', () => {
  const secret = 'test-secret-key-12345678901234567890';

  it('hashes passwords consistently using Web Crypto SHA-256', async () => {
    const hash1 = await hashPassword('admin123');
    const hash2 = await hashPassword('admin123');
    const hashOther = await hashPassword('other123');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashOther);
    expect(hash1).toBe('240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');
  });

  it('creates and verifies valid session tokens', async () => {
    const user = {
      id: 'usr_123',
      email: 'owner@gym.com',
      name: 'Gym Owner',
      role: 'OWNER' as const,
      gymId: 'gym_abc',
    };

    const token = await createSessionToken(user, secret, 3600);
    expect(token).toBeTruthy();
    expect(token.split('.').length).toBe(3);

    const verified = await verifySessionToken(token, secret);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(user.id);
    expect(verified?.email).toBe(user.email);
    expect(verified?.role).toBe(user.role);
    expect(verified?.gymId).toBe(user.gymId);
  });

  it('rejects expired tokens', async () => {
    const user = {
      id: 'usr_expired',
      email: 'expired@gym.com',
      name: 'Expired User',
      role: 'STAFF' as const,
      gymId: 'gym_abc',
    };

    // Expire immediately (negative duration)
    const token = await createSessionToken(user, secret, -10);
    const verified = await verifySessionToken(token, secret);
    expect(verified).toBeNull();
  });

  it('rejects tokens signed with a different secret', async () => {
    const user = {
      id: 'usr_forged',
      email: 'forged@gym.com',
      name: 'Forged User',
      role: 'SUPER_ADMIN' as const,
      gymId: null,
    };

    const token = await createSessionToken(user, 'secret-a', 3600);
    const verified = await verifySessionToken(token, 'secret-b');
    expect(verified).toBeNull();
  });

  it('rejects tampered token payloads', async () => {
    const user = {
      id: 'usr_normal',
      email: 'normal@gym.com',
      name: 'Normal User',
      role: 'STAFF' as const,
      gymId: 'gym_abc',
    };

    const token = await createSessionToken(user, secret, 3600);
    const parts = token.split('.');
    // Tamper with middle part (payload)
    const tamperedPayload = btoa(JSON.stringify({ ...user, role: 'SUPER_ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    const verified = await verifySessionToken(tamperedToken, secret);
    expect(verified).toBeNull();
  });
});
