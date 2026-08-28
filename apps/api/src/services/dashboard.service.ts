import { MemberRepository } from '../repositories/member.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { NotificationService } from '../lib/notifications';
import { DashboardMetrics, ExpiringMember, Payment } from '@gymtech/shared';

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
    const [
      activeMembers,
      todayAttendance,
      paymentMetrics,
      expiringRaw,
      recentPayments,
      weeklyAttendance,
      monthlyRevenueTrend,
      atRiskMembers,
      planDistribution,
    ] = await Promise.all([
      this.memberRepo.countActive(),
      this.attendanceRepo.countToday(),
      this.paymentRepo.getSummaryMetrics(),
      this.membershipRepo.getExpiringSoon(7),
      this.paymentRepo.list({ limit: 10 }),
      this.getWeeklyAttendance(),
      this.getMonthlyRevenueTrend(),
      this.getAtRiskMembers(),
      this.getPlanDistribution(),
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
      weeklyAttendance,
      monthlyRevenueTrend,
      atRiskMembers,
      planDistribution,
    };
  }

  /**
   * Real weekly attendance footfall for the last 7 calendar days
   */
  async getWeeklyAttendance(): Promise<{ day: string; date: string; count: number; avg: number }[]> {
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dates: { dateStr: string; dayName: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push({ dateStr, dayName: daysName[d.getDay()] });
    }

    const minDate = dates[0].dateStr;
    const rowsRes = await this.db
      .prepare(`
        SELECT date_key, COUNT(*) as count
        FROM attendance
        WHERE gym_id = ? AND date_key >= ?
        GROUP BY date_key
      `)
      .bind(this.gymId, minDate)
      .all<{ date_key: string; count: number }>();

    const countMap = new Map<string, number>();
    for (const r of rowsRes.results || []) {
      countMap.set(r.date_key, r.count);
    }

    // 30-day average attendance
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDateStr = thirtyDaysAgo.toISOString().split('T')[0];
    const avgRes = await this.db
      .prepare(`
        SELECT COUNT(*) as total_attendance, COUNT(DISTINCT date_key) as total_days
        FROM attendance
        WHERE gym_id = ? AND date_key >= ?
      `)
      .bind(this.gymId, thirtyDateStr)
      .first<{ total_attendance: number; total_days: number }>();

    const avg = avgRes && avgRes.total_days > 0 ? Math.round(avgRes.total_attendance / avgRes.total_days) : 0;

    return dates.map((d) => ({
      day: d.dayName,
      date: d.dateStr,
      count: countMap.get(d.dateStr) || 0,
      avg,
    }));
  }

  /**
   * Real monthly revenue trend for the last 6 calendar months
   */
  async getMonthlyRevenueTrend(): Promise<{ month: string; revenue: number; renewals: number; newJoins: number }[]> {
    const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthKeys: { key: string; label: string }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      monthKeys.push({
        key: `${year}-${monthNum}`,
        label: monthsName[d.getMonth()],
      });
    }

    const minDateTimestamp = Math.floor(new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime() / 1000);

    const rowsRes = await this.db
      .prepare(`
        SELECT 
          strftime('%Y-%m', payment_date, 'unixepoch') as month_key,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN membership_id IS NOT NULL THEN amount ELSE 0 END), 0) as renewal_amount
        FROM payments
        WHERE gym_id = ? AND status = 'COMPLETED' AND payment_date >= ?
        GROUP BY month_key
      `)
      .bind(this.gymId, minDateTimestamp)
      .all<{ month_key: string; total_amount: number; renewal_amount: number }>();

    const dataMap = new Map<string, { total: number; renewals: number }>();
    for (const r of rowsRes.results || []) {
      dataMap.set(r.month_key, {
        total: Math.round((r.total_amount || 0) / 100),
        renewals: Math.round((r.renewal_amount || 0) / 100),
      });
    }

    return monthKeys.map((m) => {
      const val = dataMap.get(m.key) || { total: 0, renewals: 0 };
      return {
        month: m.label,
        revenue: val.total,
        renewals: val.renewals,
        newJoins: Math.max(0, val.total - val.renewals),
      };
    });
  }

  /**
   * Real churn radar: active members who have had no attendance recorded in the last 7+ days
   */
  async getAtRiskMembers(): Promise<
    {
      id: string;
      name: string;
      phone: string;
      plan: string;
      daysInactive: number;
      lastCheckIn: string;
      riskLevel: 'HIGH' | 'MEDIUM';
    }[]
  > {
    const nowSec = Math.floor(Date.now() / 1000);
    const sevenDaysAgoSec = nowSec - 7 * 86400;

    const rows = await this.db
      .prepare(`
        SELECT 
          m.id,
          m.first_name,
          m.last_name,
          m.phone,
          COALESCE(mp.name, 'Active Plan') as plan_name,
          ms.start_date,
          MAX(a.check_in_time) as last_check_in
        FROM members m
        JOIN memberships ms ON ms.member_id = m.id AND ms.gym_id = m.gym_id AND ms.status = 'ACTIVE' AND ms.end_date > ?
        LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
        LEFT JOIN attendance a ON a.member_id = m.id AND a.gym_id = m.gym_id
        WHERE m.gym_id = ? AND m.deleted_at IS NULL AND m.status = 'ACTIVE'
        GROUP BY m.id
        HAVING last_check_in IS NULL OR last_check_in < ?
        ORDER BY last_check_in ASC
        LIMIT 10
      `)
      .bind(nowSec, this.gymId, sevenDaysAgoSec)
      .all<any>();

    return (rows.results || []).map((r: any) => {
      const lastSec = r.last_check_in ? Number(r.last_check_in) : Number(r.start_date);
      const daysInactive = Math.max(7, Math.floor((nowSec - lastSec) / 86400));
      return {
        id: r.id,
        name: `${r.first_name} ${r.last_name || ''}`.trim(),
        phone: r.phone,
        plan: r.plan_name,
        daysInactive,
        lastCheckIn: r.last_check_in
          ? new Date(r.last_check_in * 1000).toLocaleDateString('en-IN')
          : 'No visits yet',
        riskLevel: daysInactive >= 14 ? 'HIGH' : 'MEDIUM',
      };
    });
  }

  /**
   * Real plan distribution
   */
  async getPlanDistribution(): Promise<{ name: string; memberCount: number; revenue: number }[]> {
    const rows = await this.db
      .prepare(`
        SELECT 
          mp.name,
          COUNT(DISTINCT ms.member_id) as member_count,
          COALESCE(SUM(ms.final_amount), 0) as revenue
        FROM membership_plans mp
        LEFT JOIN memberships ms ON ms.membership_plan_id = mp.id AND ms.gym_id = mp.gym_id AND ms.status = 'ACTIVE'
        WHERE mp.gym_id = ? AND mp.is_active = 1
        GROUP BY mp.id, mp.name
        ORDER BY member_count DESC
      `)
      .bind(this.gymId)
      .all<any>();

    return (rows.results || []).map((r: any) => ({
      name: r.name,
      memberCount: Number(r.member_count) || 0,
      revenue: Math.round((Number(r.revenue) || 0) / 100),
    }));
  }
}
