const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const token = localStorage.getItem('gym_auth_token');
  const activeGymId = localStorage.getItem('gym_active_gym_id');
  const activeBranchId = localStorage.getItem('gym_active_branch_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (activeGymId) {
    headers['x-gym-id'] = activeGymId;
  }
  if (activeBranchId) {
    headers['x-branch-id'] = activeBranchId;
  }

  let url = `${API_BASE}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('gym_auth_token');
        window.location.href = '/login';
      }
      return {
        success: false,
        error: data.error || `HTTP Error ${response.status}`,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network communication error',
    };
  }
}

// Alias for convenience
export const apiClient = apiRequest;

