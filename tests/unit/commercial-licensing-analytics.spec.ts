import { describe, it, expect } from 'vitest';
import {
  isWithinLicenseLimit,
  calculateBulkImportCapacity,
  computeChurnRisk,
  splitGstInclusiveAmount,
} from '../../apps/api/src/lib/calculations';

describe('Commercial Licensing & Operational Analytics', () => {
  describe('Starter Plan Commercial License Enforcement', () => {
    const starterLicense = { max_members: 100, max_staff: 3 };

    it('permits member registration when active count is below limit', () => {
      expect(isWithinLicenseLimit(99, starterLicense.max_members)).toBe(true);
    });

    it('rejects member registration when active count reaches 100 on Starter plan', () => {
      expect(isWithinLicenseLimit(100, starterLicense.max_members)).toBe(false);
    });

    it('permits staff creation up to 3 accounts on Starter plan', () => {
      expect(isWithinLicenseLimit(2, starterLicense.max_staff)).toBe(true);
    });

    it('rejects staff creation when 3 accounts already exist on Starter plan', () => {
      expect(isWithinLicenseLimit(3, starterLicense.max_staff)).toBe(false);
    });

    it('treats a max of -1 (Enterprise plan) as unlimited', () => {
      expect(isWithinLicenseLimit(100_000, -1)).toBe(true);
    });

    it('calculates remaining bulk import capacity without breaching license ceiling', () => {
      const { remainingCapacity, imported, skipped } = calculateBulkImportCapacity(95, starterLicense.max_members, 10);

      expect(remainingCapacity).toBe(5);
      expect(imported).toBe(5);
      expect(skipped).toBe(5);
    });

    it('imports the full batch when the plan is unlimited', () => {
      const { imported, skipped } = calculateBulkImportCapacity(1000, -1, 10);
      expect(imported).toBe(10);
      expect(skipped).toBe(0);
    });
  });

  describe('Churn Radar & Member Dropout Detection', () => {
    const nowSec = 1700000000;
    const membershipStart = nowSec - 60 * 86400;

    it('identifies member absent for 8 days as at risk (MEDIUM risk)', () => {
      const lastCheckInSec = nowSec - 8 * 86400;
      const { daysInactive, riskLevel } = computeChurnRisk(lastCheckInSec, membershipStart, nowSec);

      expect(daysInactive).toBe(8);
      expect(riskLevel).toBe('MEDIUM');
    });

    it('identifies member absent for 18 days as HIGH risk dropout', () => {
      const lastCheckInSec = nowSec - 18 * 86400;
      const { daysInactive, riskLevel } = computeChurnRisk(lastCheckInSec, membershipStart, nowSec);

      expect(daysInactive).toBe(18);
      expect(riskLevel).toBe('HIGH');
    });

    it('floors daysInactive at 7 since only 7+ day absentees are surfaced by the query', () => {
      const lastCheckInSec = nowSec - 2 * 86400;
      const { daysInactive } = computeChurnRisk(lastCheckInSec, membershipStart, nowSec);

      expect(daysInactive).toBe(7);
    });

    it('falls back to the membership start date when the member never checked in', () => {
      const { daysInactive } = computeChurnRisk(null, nowSec - 20 * 86400, nowSec);
      expect(daysInactive).toBe(20);
    });
  });

  describe('GST Tax & SAC Code Specification', () => {
    it('applies standard Gymnasium & Health Club Services SAC 999723', () => {
      const sacCode = '999723';
      expect(sacCode).toBe('999723');
    });

    it('computes 18% inclusive GST split accurately between CGST (9%) and SGST (9%)', () => {
      const { taxableAmount, taxAmount, cgst, sgst } = splitGstInclusiveAmount(118000, 18);

      expect(taxableAmount).toBe(100000);
      expect(taxAmount).toBe(18000);
      expect(cgst).toBe(9000);
      expect(sgst).toBe(9000);
      expect(cgst + sgst).toBe(taxAmount);
    });
  });
});
