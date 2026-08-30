import { describe, it, expect, vi } from 'vitest';
import {
  hashPassword,
  createSessionToken,
  verifySessionToken,
  payloadToSessionUser,
} from '../../apps/api/src/lib/session';
import { verifyTurnstileToken } from '../../apps/api/src/lib/turnstile';

describe('Authentication, Password & Cryptographic Security Invariants', () => {
  const SECRET_A = 'test_jwt_secret_key_very_long_and_secure_1234567890';
  const SECRET_B = 'another_unrelated_secret_key_for_tamper_testing_987';

  describe('Password Hashing', () => {
    it('generates consistent SHA-256 hex digest for given text', async () => {
      const p1 = await hashPassword('AdminPass@123');
      const p2 = await hashPassword('AdminPass@123');
      expect(p1).toBe(p2);
      expect(p1).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('generates different digests for different passwords', async () => {
      const p1 = await hashPassword('AdminPass@123');
      const p2 = await hashPassword('AdminPass@124');
      expect(p1).not.toBe(p2);
    });
  });

  describe('Session JWT Generation & Verification', () => {
    const mockUser = {
      id: 42,
      email: 'owner@ironhouse.in',
      name: 'Vikram Rathore',
      role: 'OWNER' as const,
      gymId: 1,
    };

    it('creates and verifies a valid session token', async () => {
      const token = await createSessionToken(mockUser, SECRET_A, 3600);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const verified = await verifySessionToken(token, SECRET_A);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(42);
      expect(verified?.email).toBe('owner@ironhouse.in');
      expect(verified?.role).toBe('OWNER');
      expect(verified?.gymId).toBe(1);
    });

    it('rejects token when verified with wrong secret', async () => {
      const token = await createSessionToken(mockUser, SECRET_A, 3600);
      const verified = await verifySessionToken(token, SECRET_B);
      expect(verified).toBeNull();
    });

    it('rejects expired token', async () => {
      // Created with -100 seconds (already expired)
      const token = await createSessionToken(mockUser, SECRET_A, -100);
      const verified = await verifySessionToken(token, SECRET_A);
      expect(verified).toBeNull();
    });

    it('rejects tampered token payload', async () => {
      const token = await createSessionToken(mockUser, SECRET_A, 3600);
      const [h, p, s] = token.split('.');

      // Alter payload by decoding, changing role to SUPER_ADMIN, and re-encoding
      const decoded = JSON.parse(atob(p));
      decoded.role = 'SUPER_ADMIN';
      const tamperedPayload = btoa(JSON.stringify(decoded));

      const tamperedToken = `${h}.${tamperedPayload}.${s}`;
      const verified = await verifySessionToken(tamperedToken, SECRET_A);
      expect(verified).toBeNull();
    });

    it('rejects malformed token strings', async () => {
      expect(await verifySessionToken('invalid-token', SECRET_A)).toBeNull();
      expect(await verifySessionToken('part1.part2', SECRET_A)).toBeNull();
      expect(await verifySessionToken('part1.part2.part3.part4', SECRET_A)).toBeNull();
      expect(await verifySessionToken('', SECRET_A)).toBeNull();
    });
  });

  describe('payloadToSessionUser conversion', () => {
    it('correctly maps payload to clean SessionUser object without exp', () => {
      const payload = {
        id: 7,
        email: 'staff@gym.in',
        name: 'Arjun Singh',
        role: 'STAFF' as const,
        gymId: 2,
        exp: 1800000000,
      };

      const sessionUser = payloadToSessionUser(payload);
      expect(sessionUser).toEqual({
        id: 7,
        email: 'staff@gym.in',
        name: 'Arjun Singh',
        role: 'STAFF',
        gymId: 2,
      });
      expect((sessionUser as any).exp).toBeUndefined();
    });
  });

  describe('Cloudflare Turnstile Verification', () => {
    it('rejects missing or empty token', async () => {
      const res = await verifyTurnstileToken(null);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();

      const res2 = await verifyTurnstileToken('');
      expect(res2.success).toBe(false);
    });

    it('allows dev bypass tokens without network call', async () => {
      const res1 = await verifyTurnstileToken('cf_turnstile_dev_test_token');
      expect(res1.success).toBe(true);

      const res2 = await verifyTurnstileToken('XXXX.DUMMY.TOKEN.XXXX');
      expect(res2.success).toBe(true);
    });
  });
});
