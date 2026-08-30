import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  CreateMemberRequest,
  CreateMemberResponse,
  UpdateMemberRequest,
  MemberDetailResponse,
  RenewMembershipRequest,
  RenewMembershipResponse,
  CreatePlanRequest,
  RecordPaymentRequest,
  RecordPaymentResponse,
  CheckInRequest,
  CheckInResponse,
  CreateStaffRequest,
  CreateGymRequest,
  ToggleGymStatusRequest,
  DashboardMetrics,
  GymMembershipPlan,
  User,
  Member,
  Payment,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  BulkImportMembersRequest,
  BulkImportMembersResponse,
  MemberLoginRequest,
  MemberLoginResponse,
  FreezeMemberResponse,
  RecordPtCollectionRequest,
  RecordPtCollectionResponse,
  PtCollection,
  PtSummary,
  InvoiceData,
  NotificationSettingsRequest,
  NotificationSettingsResponse,
  TestSmtpRequest,
  SmtpSettings,
} from '@gymtech/shared';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://gymtech-api.ap-fitapp.workers.dev';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('gym_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_user');
      localStorage.removeItem('gym_info');
      // If we are not on login or landing, redirect
      if (!window.location.hash.includes('/login') && window.location.hash !== '' && window.location.hash !== '#/') {
        window.location.hash = '#/login';
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data as T;
  }

  // Auth
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<MeResponse> {
    return this.request<MeResponse>('/api/auth/me');
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async memberLogin(payload: MemberLoginRequest): Promise<MemberLoginResponse> {
    return this.request<MemberLoginResponse>('/api/auth/member-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMemberPortalData(): Promise<{
    member: Member;
    activeMembership?: any;
    memberships: any[];
    payments: Payment[];
    attendance: any[];
    gym: { name: string; address?: string; phone?: string };
  }> {
    return this.request('/api/member/portal');
  }

  // Dashboard
  async getDashboard(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/api/dashboard');
  }

  // Members
  async getMembers(params?: { search?: string; status?: string; limit?: number; offset?: number }): Promise<{ members: any[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));

    const qs = q.toString();
    return this.request<{ members: any[] }>(`/api/members${qs ? `?${qs}` : ''}`);
  }

  async createMember(payload: CreateMemberRequest): Promise<CreateMemberResponse> {
    return this.request<CreateMemberResponse>('/api/members', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async bulkImportMembers(payload: BulkImportMembersRequest): Promise<BulkImportMembersResponse> {
    return this.request<BulkImportMembersResponse>('/api/members/bulk-import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMemberDetail(id: string): Promise<MemberDetailResponse> {
    return this.request<MemberDetailResponse>(`/api/members/${id}`);
  }

  async updateMember(id: string, payload: UpdateMemberRequest): Promise<Member> {
    return this.request<Member>(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async renewMembership(id: string, payload: RenewMembershipRequest): Promise<RenewMembershipResponse> {
    return this.request<RenewMembershipResponse>(`/api/members/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async freezeMember(id: string, reason?: string): Promise<FreezeMemberResponse> {
    return this.request<FreezeMemberResponse>(`/api/members/${id}/freeze`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unfreezeMember(id: string): Promise<FreezeMemberResponse> {
    return this.request<FreezeMemberResponse>(`/api/members/${id}/unfreeze`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Plans
  async getPlans(): Promise<{ plans: GymMembershipPlan[] }> {
    return this.request<{ plans: GymMembershipPlan[] }>('/api/plans');
  }

  async createPlan(payload: CreatePlanRequest): Promise<GymMembershipPlan> {
    return this.request<GymMembershipPlan>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Payments
  async getPayments(params?: { limit?: number; memberId?: string }): Promise<{ payments: Payment[]; summary: any }> {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.memberId) q.set('memberId', params.memberId);
    const qs = q.toString();
    return this.request<{ payments: Payment[]; summary: any }>(`/api/payments${qs ? `?${qs}` : ''}`);
  }

  async recordPayment(payload: RecordPaymentRequest): Promise<RecordPaymentResponse> {
    return this.request<RecordPaymentResponse>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Attendance
  async getAttendance(): Promise<{ logs: any[] }> {
    return this.request<{ logs: any[] }>('/api/attendance');
  }

  async checkIn(payload: CheckInRequest): Promise<CheckInResponse> {
    return this.request<CheckInResponse>('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Staff
  async getStaff(): Promise<{ staff: User[] }> {
    return this.request<{ staff: User[] }>('/api/staff');
  }

  async createStaff(payload: CreateStaffRequest): Promise<User> {
    return this.request<User>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettingsResponse> {
    return this.request<NotificationSettingsResponse>('/api/settings/notifications');
  }

  async updateNotificationSettings(
    payload: NotificationSettingsRequest
  ): Promise<NotificationSettingsResponse> {
    return this.request<NotificationSettingsResponse>('/api/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async testSmtp(payload: TestSmtpRequest): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/settings/smtp/test', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Reports
  async getReports(period: 'month' | 'quarter' | 'year' = 'month'): Promise<{
    metrics: DashboardMetrics;
    period: string;
    periodRevenue: number;
    periodPaymentCount: number;
    planBreakdown: any[];
  }> {
    return this.request(`/api/reports?period=${period}`);
  }

  async getInvoice(paymentId: string): Promise<InvoiceData> {
    return this.request<InvoiceData>(`/api/payments/${paymentId}/invoice`);
  }

  async downloadReportExport(type: 'payments' | 'members' | 'attendance' | 'dues'): Promise<void> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE_URL}/api/reports/export?type=${type}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Export failed (HTTP ${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymtech-${type}-report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // PT Collections
  async getPtCollections(params?: { trainerId?: string }): Promise<{ collections: PtCollection[] }> {
    const q = new URLSearchParams();
    if (params?.trainerId) q.set('trainerId', params.trainerId);
    const qs = q.toString();
    return this.request<{ collections: PtCollection[] }>(`/api/pt/collections${qs ? `?${qs}` : ''}`);
  }

  async getPtSummary(): Promise<PtSummary> {
    return this.request<PtSummary>('/api/pt/summary');
  }

  async recordPtCollection(payload: RecordPtCollectionRequest): Promise<RecordPtCollectionResponse> {
    return this.request<RecordPtCollectionResponse>('/api/pt/collections', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async settlePtCommission(id: string, status: 'PAID' | 'PENDING'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/pt/collections/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Super Admin
  async getAdminGyms(): Promise<{ gyms: any[] }> {
    return this.request<{ gyms: any[] }>('/api/admin/gyms');
  }

  async getAdminPlans(): Promise<{ plans: any[] }> {
    return this.request<{ plans: any[] }>('/api/admin/plans');
  }

  async getAdminMetrics(): Promise<{ totalGyms: number; activeGyms: number; totalMembers: number; platformRevenue: number }> {
    return this.request<{ totalGyms: number; activeGyms: number; totalMembers: number; platformRevenue: number }>('/api/admin/metrics');
  }

  async createGym(payload: CreateGymRequest): Promise<{ gymId: string; userId: string }> {
    return this.request<{ gymId: string; userId: string }>('/api/admin/gyms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleGymStatus(gymId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<{ success: boolean; status: string }> {
    return this.request<{ success: boolean; status: string }>(`/api/admin/gyms/${gymId}/status`, {
      method: 'POST',
      body: JSON.stringify({ gymId, status }),
    });
  }
}

export const api = new ApiClient();
