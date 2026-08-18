const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('simbioly_token') : null;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  const json: ApiResponse<T> = text ? JSON.parse(text) : { success: true, data: {} as T };

  if (response.status === 401 || json.error?.code === 'UNAUTHORIZED') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simbioly_token');
      // Redirect to login if user attempts to access a protected API without valid session
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    const errorMsg = json.error?.message || 'Authentication required';
    throw new Error(errorMsg);
  }

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

export function getAvatarUrl(avatarUrl?: string | null, seed: string = 'user'): string {
  if (!avatarUrl) return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
  if (avatarUrl.startsWith('/uploads')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    return `${baseUrl}${avatarUrl}`;
  }
  return avatarUrl;
}
