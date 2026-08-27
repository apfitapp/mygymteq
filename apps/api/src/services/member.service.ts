import { MemberRepository } from '../repositories/member.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { NotificationService } from '../lib/notifications';
import { Member, Membership, Payment, Attendance, PaymentMode } from '@gym/shared';

export class MemberService {
  private memberRepo: MemberRepository;
  private membershipRepo: MembershipRepository;
  private planRepo: PlanRepository;
  private paymentRepo: PaymentRepository;
  private attendanceRepo: AttendanceRepository;

  constructor(
    private db: D1Database,
    private gymId: string,
    private userId: string,
    private gymName: string = 'Our Gym'
  ) {
    this.memberRepo = new MemberRepository(db, gymId);
    this.membershipRepo = new MembershipRepository(db, gymId);
    this.planRepo = new PlanRepository(db, gymId);
    this.paymentRepo = new PaymentRepository(db, gymId);
    this.attendanceRepo = new AttendanceRepository(db, gymId);
  }

  async createMemberWithPlan(data: {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth?: string;
    joinedDate?: string;
    photoUrl?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    planId: string;
    discountAmount?: number;
    initialPaymentAmount?: number;
    paymentMode?: PaymentMode;
    referenceId?: string;
  }) {
    // 1. Validate Membership Plan
    const plan = await this.planRepo.findById(data.planId);
    if (!plan) {
      throw new Error('Selected membership plan does not exist or is inactive');
    }

    // 2. Generate IDs
    const memberId = `mem_${crypto.randomUUID().slice(0, 8)}`;
    const memberCode = await this.memberRepo.getNextMemberCode();
    const joinedTimestamp = data.joinedDate
      ? Math.floor(new Date(data.joinedDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    // 3. Create Member
    await this.memberRepo.create({
      id: memberId,
      member_code: memberCode,
      first_name: data.firstName.trim(),
      last_name: data.lastName?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone.trim(),
      gender: data.gender || null,
      date_of_birth: data.dateOfBirth || null,
      photo_url: data.photoUrl || null,
      address: data.address || null,
      emergency_contact_name: data.emergencyContactName || null,
      emergency_contact_phone: data.emergencyContactPhone || null,
      joined_date: joinedTimestamp,
    });

    // 4. Calculate Dates and Financials
    const startTimestamp = joinedTimestamp;
    const endTimestamp = startTimestamp + plan.duration_months * 30 * 86400;

    const totalAmount = plan.price + plan.admission_fee;
    const discountAmount = Math.max(0, (data.discountAmount || 0) * 100);
    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const paidAmount = Math.min(finalAmount, Math.max(0, (data.initialPaymentAmount || 0) * 100));
    const dueAmount = Math.max(0, finalAmount - paidAmount);

    const membershipId = `ms_${crypto.randomUUID().slice(0, 8)}`;

    await this.membershipRepo.create({
      id: membershipId,
      member_id: memberId,
      membership_plan_id: plan.id,
      start_date: startTimestamp,
      end_date: endTimestamp,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
    });

    // 5. Record Initial Payment
    let receiptNumber: string | undefined;
    let payment: Payment | null = null;
    if (paidAmount > 0) {
      const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;
      receiptNumber = await this.paymentRepo.getNextReceiptNumber();

      await this.paymentRepo.record({
        id: paymentId,
        member_id: memberId,
        membership_id: membershipId,
        receipt_number: receiptNumber,
        amount: paidAmount,
        payment_date: startTimestamp,
        payment_mode: data.paymentMode || 'CASH',
        reference_id: data.referenceId || null,
        recorded_by_user_id: this.userId,
        notes: `Initial payment on registration for ${plan.name}`,
      });
    }

    // 6. WhatsApp Welcome
    const notif = new NotificationService(this.gymName);
    const whatsappUrl = notif.generateWhatsAppUrl({
      recipientPhone: data.phone,
      recipientName: `${data.firstName} ${data.lastName || ''}`.trim(),
      type: 'WELCOME',
      params: {
        memberCode,
      },
    });

    const createdMember = await this.memberRepo.findById(memberId);
    const createdMembership = await this.membershipRepo.findActiveByMemberId(memberId);

    return {
      member: createdMember!,
      membership: createdMembership!,
      receiptNumber,
      whatsappUrl,
    };
  }

  async renewMembership(data: {
    memberId: string;
    planId: string;
    startDate?: string;
    discountAmount?: number;
    paymentAmount?: number;
    paymentMode?: PaymentMode;
    referenceId?: string;
    notes?: string;
  }) {
    const member = await this.memberRepo.findById(data.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const plan = await this.planRepo.findById(data.planId);
    if (!plan) {
      throw new Error('Selected plan not found');
    }

    const currentActive = await this.membershipRepo.findActiveByMemberId(data.memberId);
    let startTimestamp: number;
    if (data.startDate) {
      startTimestamp = Math.floor(new Date(data.startDate).getTime() / 1000);
    } else if (currentActive && currentActive.end_date > Math.floor(Date.now() / 1000)) {
      startTimestamp = currentActive.end_date;
    } else {
      startTimestamp = Math.floor(Date.now() / 1000);
    }

    const endTimestamp = startTimestamp + plan.duration_months * 30 * 86400;
    const totalAmount = plan.price;
    const discountAmount = Math.max(0, (data.discountAmount || 0) * 100);
    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const paidAmount = Math.min(finalAmount, Math.max(0, (data.paymentAmount || 0) * 100));
    const dueAmount = Math.max(0, finalAmount - paidAmount);

    const membershipId = `ms_${crypto.randomUUID().slice(0, 8)}`;

    await this.membershipRepo.create({
      id: membershipId,
      member_id: data.memberId,
      membership_plan_id: plan.id,
      start_date: startTimestamp,
      end_date: endTimestamp,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      notes: data.notes || 'Renewal',
    });

    let receiptNumber: string | undefined;
    if (paidAmount > 0) {
      const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;
      receiptNumber = await this.paymentRepo.getNextReceiptNumber();

      await this.paymentRepo.record({
        id: paymentId,
        member_id: data.memberId,
        membership_id: membershipId,
        receipt_number: receiptNumber,
        amount: paidAmount,
        payment_date: Math.floor(Date.now() / 1000),
        payment_mode: data.paymentMode || 'CASH',
        reference_id: data.referenceId || null,
        recorded_by_user_id: this.userId,
        notes: `Renewal payment for ${plan.name}`,
      });
    }

    const notif = new NotificationService(this.gymName);
    const whatsappUrl = notif.generateWhatsAppUrl({
      recipientPhone: member.phone,
      recipientName: `${member.first_name} ${member.last_name || ''}`.trim(),
      type: 'RENEWAL_CONFIRMATION',
      params: {
        newExpiryDate: new Date(endTimestamp * 1000).toLocaleDateString('en-IN'),
      },
    });

    return {
      membershipId,
      receiptNumber,
      whatsappUrl,
    };
  }

  async getMemberDetails(memberId: string) {
    const member = await this.memberRepo.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const [memberships, payments, attendance] = await Promise.all([
      this.membershipRepo.findByMemberId(memberId),
      this.paymentRepo.list({ memberId, limit: 20 }),
      this.attendanceRepo.listByMember(memberId, 30),
    ]);

    const activeMembership = memberships.find((m) => m.status === 'ACTIVE') || null;

    return {
      member,
      activeMembership,
      memberships,
      payments,
      attendance,
    };
  }
}
