import { describe, it, expect } from 'vitest';
import { hashPassword, createSessionToken, verifySessionToken } from '@/lib/auth/session';

describe('Auth & Session Security (Edge Web Crypto)', () => {
  const secret = 'test-secret-key-1234567890-test';

  it('hashes passwords using standard SHA-256 hex string', async () => {
    const hash1 = await hashPassword('admin123');
    const hash2 = await hashPassword('admin123');
    const hashDifferent = await hashPassword('different');

    expect(hash1).toBe(hash2);
    expect(hash1).toBe('240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');
    expect(hash1).not.toBe(hashDifferent);
  });

  it('generates a valid signed JWT and extracts session payload', async () => {
    const token = await createSessionToken(
      {
        id: 'usr_1001',
        email: 'owner@ironhouse.in',
        name: 'Gym Owner',
        role: 'OWNER',
        gymId: 'gym_ironhouse',
      },
      secret
    );

    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3);

    const verified = await verifySessionToken(token, secret);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe('usr_1001');
    expect(verified?.gymId).toBe('gym_ironhouse');
    expect(verified?.role).toBe('OWNER');
  });

  it('rejects tampered tokens or wrong secrets', async () => {
    const token = await createSessionToken(
      {
        id: 'usr_1001',
        email: 'owner@ironhouse.in',
        name: 'Gym Owner',
        role: 'OWNER',
        gymId: 'gym_ironhouse',
      },
      secret
    );

    // Wrong secret
    const verifiedWrongSecret = await verifySessionToken(token, 'wrong-secret');
    expect(verifiedWrongSecret).toBeNull();

    // Tampered payload
    const parts = token.split('.');
    const tampered = `${parts[0]}.eyJob21lIjoidHJ1ZSJ9.${parts[2]}`;
    const verifiedTampered = await verifySessionToken(tampered, secret);
    expect(verifiedTampered).toBeNull();
  });
});
