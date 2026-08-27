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
} from '@gym/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

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

  // Reports
  async getReports(): Promise<{ metrics: DashboardMetrics; planBreakdown: any[] }> {
    return this.request<{ metrics: DashboardMetrics; planBreakdown: any[] }>('/api/reports');
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
