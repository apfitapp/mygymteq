import { describe, it, expect } from 'vitest';
import { NotificationService } from '@/lib/notifications';

describe('NotificationService (WhatsApp Click-to-Chat Engine)', () => {
  const notif = new NotificationService('Iron House Fitness');

  it('normalizes a 10-digit Indian phone number to international wa.me format (+91)', () => {
    const url = notif.generateWhatsAppUrl({
      recipientPhone: '9876543210',
      recipientName: 'Rahul Sharma',
      type: 'WELCOME',
      params: { memberCode: 'MEM-1001' },
    });

    expect(url).toContain('https://wa.me/919876543210?text=');
    expect(url).toContain(encodeURIComponent('Welcome to Iron House Fitness'));
    expect(url).toContain(encodeURIComponent('MEM-1001'));
  });

  it('correctly constructs payment receipt message and preserves rupees amount', () => {
    const url = notif.generateWhatsAppUrl({
      recipientPhone: '+91 98765 43211',
      recipientName: 'Sneha Reddy',
      type: 'PAYMENT_RECEIPT',
      params: {
        amount: 3000,
        paymentMode: 'UPI',
        receiptNumber: 'RCP-2026-0002',
      },
    });

    expect(url).toContain('https://wa.me/919876543211?text=');
    expect(url).toContain(encodeURIComponent('₹3000'));
    expect(url).toContain(encodeURIComponent('RCP-2026-0002'));
  });

  it('correctly formats expiry reminder message', () => {
    const url = notif.generateWhatsAppUrl({
      recipientPhone: '9876543212',
      recipientName: 'Amit Patel',
      type: 'EXPIRY_REMINDER',
      params: { expiryDate: '31/03/2026' },
    });

    expect(url).toContain('https://wa.me/919876543212?text=');
    expect(url).toContain(encodeURIComponent('31/03/2026'));
  });
});
