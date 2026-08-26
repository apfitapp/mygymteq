import { AttendanceRepository } from '../repositories/attendance.repository';
import { MemberRepository } from '../repositories/member.repository';

export class AttendanceService {
  private attendanceRepo: AttendanceRepository;
  private memberRepo: MemberRepository;

  constructor(
    db: D1Database,
    gymId: string,
    private userId?: string
  ) {
    this.attendanceRepo = new AttendanceRepository(db, gymId);
    this.memberRepo = new MemberRepository(db, gymId);
  }

  async quickCheckIn(identifier: string, method: 'MANUAL' | 'QR_SCAN' | 'SELF_KIOSK' = 'MANUAL') {
    const member = await this.memberRepo.findByIdentifier(identifier.trim());
    if (!member) {
      throw new Error(`No active member found with Phone or Member ID: ${identifier}`);
    }

    if (member.status !== 'ACTIVE') {
      throw new Error(`Member ${member.first_name} ${member.last_name || ''} is currently ${member.status}. Access denied.`);
    }

    const attendanceId = `att_${crypto.randomUUID().slice(0, 8)}`;
    const result = await this.attendanceRepo.checkIn({
      id: attendanceId,
      member_id: member.id,
      method,
      recorded_by_user_id: this.userId,
    });

    return {
      memberId: member.id,
      memberName: `${member.first_name} ${member.last_name || ''}`.trim(),
      memberCode: member.member_code,
      phone: member.phone,
      photoUrl: member.photo_url,
      alreadyCheckedIn: result.alreadyCheckedIn,
      checkInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
