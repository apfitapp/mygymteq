import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../src/lib/crypto';
import { generateWhatsAppLink, calculateMembershipEndDate, formatInr } from '@gym/shared';

describe('Security & Crypto Utilities', () => {
  it('correctly hashes and verifies passwords using WebCrypto PBKDF2', async () => {
    const password = 'SuperSecurePassword@2026';
    const hash = await hashPassword(password);
    expect(hash).toContain('pbkdf2:sha256:100000$');

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('correctly signs and validates JWT with claims and expiration', async () => {
    const secret = 'test-secret-key-12345';
    const payload = {
      sub: 'usr_123',
      email: 'owner@ironhouse.in',
      role: 'GYM_OWNER',
      gymId: 'gym_ironhouse',
      branchId: 'br_main',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = await signJwt(payload, secret);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = await verifyJwt<typeof payload>(token, secret);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe('usr_123');
    expect(decoded?.gymId).toBe('gym_ironhouse');

    // Mismatched secret should fail
    const invalidDecoded = await verifyJwt(token, 'different-secret');
    expect(invalidDecoded).toBeNull();
  });
});

describe('WhatsApp Click-to-Chat & Localization', () => {
  it('formats Indian phone numbers and builds zero-cost wa.me URLs', () => {
    const link = generateWhatsAppLink('9876543210', 'WELCOME_MEMBER', {
      gymName: 'Iron House Gym',
      memberName: 'Rahul Sharma',
      memberCode: 'MEM-1001',
      startDate: '2026-08-26',
    });

    expect(link).toContain('https://wa.me/919876543210');
    expect(link).toContain(encodeURIComponent('Rahul Sharma'));
    expect(link).toContain(encodeURIComponent('Iron House Gym'));
  });

  it('correctly formats INR currency with paise', () => {
    expect(formatInr(150000)).toBe('₹1,500');
    expect(formatInr(99900)).toBe('₹999');
    expect(formatInr(1200000)).toBe('₹12,000');
  });

  it('accurately computes membership end dates', () => {
    const endDate = calculateMembershipEndDate('2026-01-01', 3);
    expect(endDate).toBe('2026-04-01');
  });
});
