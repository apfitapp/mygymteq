import { PaymentRepository } from '../repositories/payment.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { MemberRepository } from '../repositories/member.repository';
import { NotificationService } from '../../lib/notifications';

export class PaymentService {
  private paymentRepo: PaymentRepository;
  private membershipRepo: MembershipRepository;
  private memberRepo: MemberRepository;

  constructor(
    db: D1Database,
    gymId: string,
    private userId: string,
    private gymName: string = 'Our Gym'
  ) {
    this.paymentRepo = new PaymentRepository(db, gymId);
    this.membershipRepo = new MembershipRepository(db, gymId);
    this.memberRepo = new MemberRepository(db, gymId);
  }

  async recordDuePayment(data: {
    memberId: string;
    membershipId: string;
    amount: number; // in Rupees
    paymentMode: string;
    referenceId?: string;
    notes?: string;
  }) {
    const member = await this.memberRepo.findById(data.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const amountInPaise = Math.max(0, data.amount * 100);
    if (amountInPaise <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;
    const receiptNumber = await this.paymentRepo.getNextReceiptNumber();

    await this.paymentRepo.record({
      id: paymentId,
      member_id: data.memberId,
      membership_id: data.membershipId,
      receipt_number: receiptNumber,
      amount: amountInPaise,
      payment_date: Math.floor(Date.now() / 1000),
      payment_mode: data.paymentMode,
      reference_id: data.referenceId,
      recorded_by_user_id: this.userId,
      notes: data.notes || 'Due clearance payment',
    });

    // Update due balance on membership
    await this.membershipRepo.updatePaymentProgress(data.membershipId, amountInPaise);

    const notif = new NotificationService(this.gymName);
    const whatsappUrl = notif.generateWhatsAppUrl({
      recipientPhone: member.phone,
      recipientName: `${member.first_name} ${member.last_name || ''}`.trim(),
      type: 'PAYMENT_RECEIPT',
      params: {
        amount: data.amount,
        paymentMode: data.paymentMode,
        receiptNumber,
      },
    });

    return {
      paymentId,
      receiptNumber,
      whatsappUrl,
    };
  }
}
