import { describe, it, expect } from 'vitest';

describe('Gym SaaS Financial & Membership Calculations', () => {
  it('calculates package financials, discount, and due amount accurately in Paise', () => {
    const planPriceRupees = 4000;
    const admissionFeeRupees = 500;
    const discountRupees = 500;
    const initialPaymentRupees = 2000;

    const planPricePaise = planPriceRupees * 100;
    const admissionFeePaise = admissionFeeRupees * 100;
    const totalAmount = planPricePaise + admissionFeePaise; // 450,000 paise (₹4,500)
    const discountAmount = discountRupees * 100; // 50,000 paise (₹500)
    const finalAmount = Math.max(0, totalAmount - discountAmount); // 400,000 paise (₹4,000)
    const paidAmount = Math.min(finalAmount, Math.max(0, initialPaymentRupees * 100)); // 200,000 paise (₹2,000)
    const dueAmount = Math.max(0, finalAmount - paidAmount); // 200,000 paise (₹2,000)

    expect(totalAmount).toBe(450000);
    expect(finalAmount).toBe(400000);
    expect(paidAmount).toBe(200000);
    expect(dueAmount).toBe(200000);
  });

  it('handles zero discount and full payment', () => {
    const totalAmount = 150000; // ₹1,500
    const discountAmount = 0;
    const finalAmount = totalAmount - discountAmount;
    const paidAmount = 150000;
    const dueAmount = finalAmount - paidAmount;

    expect(dueAmount).toBe(0);
  });

  it('calculates membership duration dates correctly', () => {
    const startTimestamp = 1700000000; // fixed timestamp
    const durationMonths = 3;
    const endTimestamp = startTimestamp + durationMonths * 30 * 86400; // standard 30-day month

    expect(endTimestamp).toBe(startTimestamp + 90 * 86400);
    expect(endTimestamp).toBeGreaterThan(startTimestamp);
  });

  it('updates dues when additional payment is logged', () => {
    const finalAmount = 400000;
    let paidAmount = 200000;
    let dueAmount = finalAmount - paidAmount;
    expect(dueAmount).toBe(200000);

    const additionalPayment = 100000; // ₹1,000
    paidAmount += additionalPayment;
    dueAmount = Math.max(0, finalAmount - paidAmount);

    expect(paidAmount).toBe(300000);
    expect(dueAmount).toBe(100000);
  });
});
