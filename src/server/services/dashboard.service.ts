import { MemberRepository } from '../repositories/member.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { AttendanceRepository } from '../repositories/attendance.repository';

export class DashboardService {
  private memberRepo: MemberRepository;
  private membershipRepo: MembershipRepository;
  private paymentRepo: PaymentRepository;
  private attendanceRepo: AttendanceRepository;

  constructor(db: D1Database, gymId: string) {
    this.memberRepo = new MemberRepository(db, gymId);
    this.membershipRepo = new MembershipRepository(db, gymId);
    this.paymentRepo = new PaymentRepository(db, gymId);
    this.attendanceRepo = new AttendanceRepository(db, gymId);
  }

  async getMetrics() {
    const [activeMembers, todayAttendance, financialSummary, expiringSoon, recentPayments] = await Promise.all([
      this.memberRepo.countActive(),
      this.attendanceRepo.countToday(),
      this.paymentRepo.getSummaryMetrics(),
      this.membershipRepo.getExpiringSoon(7),
      this.paymentRepo.list({ limit: 5 }),
    ]);

    return {
      activeMembers,
      todayAttendance,
      monthlyRevenue: Math.round(financialSummary.monthlyRevenue / 100),
      todayRevenue: Math.round(financialSummary.todayRevenue / 100),
      pendingDues: Math.round(financialSummary.pendingDues / 100),
      expiringSoon,
      recentPayments,
    };
  }
}
