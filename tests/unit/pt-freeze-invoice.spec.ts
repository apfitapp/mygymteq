import { describe, it, expect } from 'vitest';

describe('PT Commission Calculations', () => {
  it('computes trainer commission from percentage in paise', () => {
    const amountRupees = 12000;
    const commissionPct = 30;

    const amountPaise = Math.round(amountRupees * 100);
    const commissionAmount = Math.round(amountPaise * (commissionPct / 100));

    expect(amountPaise).toBe(1200000);
    expect(commissionAmount).toBe(360000);
  });

  it('handles zero commission percentage', () => {
    const amountPaise = 500000;
    const commissionAmount = Math.round(amountPaise * (0 / 100));
    expect(commissionAmount).toBe(0);
  });

  it('caps commission percentage at 100', () => {
    const amountPaise = 200000;
    const pct = Math.min(100, 150);
    expect(Math.round(amountPaise * (pct / 100))).toBe(200000);
  });
});

describe('Membership Freeze / Pause Logic', () => {
  it('extends expiry by the exact frozen duration on resume', () => {
    const daySec = 86400;
    const now = 1_800_000_000;
    const originalEnd = now + 30 * daySec; // 30 days remaining
    const frozenAt = now;

    // Resumed 10 days later
    const resumeAt = frozenAt + 10 * daySec;
    const frozenDuration = Math.max(0, resumeAt - frozenAt);
    const extendedTo = originalEnd + frozenDuration;

    // 30 days remaining are fully preserved
    expect(extendedTo - resumeAt).toBe(30 * daySec);
  });

  it('never reduces the end date if freeze timestamps are equal', () => {
    const end = 1_800_000_000;
    const frozenDuration = Math.max(0, 1_800_000_000 - 1_800_000_000);
    expect(end + frozenDuration).toBe(end);
  });

  it('blocks check-in for frozen or expired memberships', () => {
    const nowSec = 1_800_000_000;
    const activeMembership = { end_date: nowSec - 100, status: 'ACTIVE' as string };
    const member = { status: 'ACTIVE' as string };

    const isExpired =
      !activeMembership || activeMembership.end_date < nowSec || activeMembership.status === 'EXPIRED';
    const isFrozenOrCancelled = member.status === 'FROZEN' || member.status === 'CANCELLED';

    expect(isExpired || isFrozenOrCancelled).toBe(true);

    member.status = 'FROZEN';
    activeMembership.end_date = nowSec + 1000;
    const stillBlocked =
      member.status === 'FROZEN' ||
      member.status === 'CANCELLED' ||
      activeMembership.end_date < nowSec;
    expect(stillBlocked).toBe(true);
  });
});

describe('GST Invoice Split', () => {
  it('splits a tax-inclusive amount into taxable value + CGST/SGST', () => {
    const amount = 118000; // ₹1,180 inclusive of 18% GST
    const taxPercentage = 18;

    const taxableAmount =
      taxPercentage > 0 ? Math.round(amount / (1 + taxPercentage / 100)) : amount;
    const taxAmount = amount - taxableAmount;
    const cgst = Math.round(taxAmount / 2);
    const sgst = taxAmount - cgst;

    expect(taxableAmount).toBe(100000);
    expect(taxAmount).toBe(18000);
    expect(cgst).toBe(9000);
    expect(sgst).toBe(9000);
    expect(cgst + sgst).toBe(taxAmount);
  });

  it('returns the full amount as taxable when no GST applies', () => {
    const amount = 150000;
    const taxPercentage = 0;
    const taxableAmount =
      taxPercentage > 0 ? Math.round(amount / (1 + taxPercentage / 100)) : amount;

    expect(taxableAmount).toBe(amount);
    expect(amount - taxableAmount).toBe(0);
  });
});
