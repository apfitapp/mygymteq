import { MemberRepository } from '../repositories/member.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { NotificationService } from '../lib/notifications';
import { DashboardMetrics, ExpiringMember, Payment } from '@gym/shared';

export class DashboardService {
  private memberRepo: MemberRepository;
  private membershipRepo: MembershipRepository;
  private paymentRepo: PaymentRepository;
  private attendanceRepo: AttendanceRepository;
  private notif: NotificationService;

  constructor(private db: D1Database, private gymId: string, private gymName: string = 'Our Gym') {
    this.memberRepo = new MemberRepository(db, gymId);
    this.membershipRepo = new MembershipRepository(db, gymId);
    this.paymentRepo = new PaymentRepository(db, gymId);
    this.attendanceRepo = new AttendanceRepository(db, gymId);
    this.notif = new NotificationService(gymName);
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const [activeMembers, todayAttendance, paymentMetrics, expiringRaw, recentPayments] =
      await Promise.all([
        this.memberRepo.countActive(),
        this.attendanceRepo.countToday(),
        this.paymentRepo.getSummaryMetrics(),
        this.membershipRepo.getExpiringSoon(7),
        this.paymentRepo.list({ limit: 10 }),
      ]);

    const expiringSoon: ExpiringMember[] = expiringRaw.map((m: any) => ({
      id: m.id,
      first_name: m.first_name,
      last_name: m.last_name,
      phone: m.phone,
      plan_name: m.plan_name,
      end_date: m.end_date,
      due_amount: m.due_amount,
      whatsapp_url: this.notif.generateWhatsAppUrl({
        recipientPhone: m.phone,
        recipientName: `${m.first_name} ${m.last_name || ''}`.trim(),
        type: 'EXPIRY_REMINDER',
        params: {
          expiryDate: new Date(m.end_date * 1000).toLocaleDateString('en-IN'),
        },
      }),
    }));

    const recentWithWhatsApp = recentPayments.map((p: any) => ({
      ...p,
      whatsapp_url: this.notif.generateWhatsAppUrl({
        recipientPhone: p.phone,
        recipientName: `${p.first_name} ${p.last_name || ''}`.trim(),
        type: 'PAYMENT_RECEIPT',
        params: {
          amount: p.amount / 100,
          paymentMode: p.payment_mode,
          receiptNumber: p.receipt_number,
        },
      }),
    }));

    return {
      activeMembers,
      todayAttendance,
      monthlyRevenue: paymentMetrics.monthlyRevenue,
      pendingDues: paymentMetrics.pendingDues,
      expiringSoon,
      recentPayments: recentWithWhatsApp,
    };
  }
}
