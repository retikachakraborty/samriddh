export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('samriddh_access_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('samriddh_access_token', token);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem('samriddh_refresh_token');
}

export function setStoredRefreshToken(refreshToken: string): void {
  localStorage.setItem('samriddh_refresh_token', refreshToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem('samriddh_access_token');
  localStorage.removeItem('samriddh_refresh_token');
  localStorage.removeItem('samriddh_user');
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function requestFn<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method: 'GET',
    headers: reqHeaders,
    ...customConfig,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(err.message || 'Network request failed. Ensure backend service is reachable.', 0);
  }

  // If 401 and we have a refresh token, try refreshing once
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/')) {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.access_token) {
            setStoredToken(refreshData.access_token);
            if (refreshData.refresh_token) {
              setStoredRefreshToken(refreshData.refresh_token);
            }
            // Retry original request
            reqHeaders['Authorization'] = `Bearer ${refreshData.access_token}`;
            response = await fetch(url, { ...config, headers: reqHeaders });
          }
        } else {
          clearStoredTokens();
        }
      } catch {
        clearStoredTokens();
      }
    }
  }

  if (!response.ok) {
    let errorDetail = 'Request failed';
    let data: any = null;
    try {
      data = await response.json();
      errorDetail = data.detail || data.message || data.error_description || JSON.stringify(data);
    } catch {
      errorDetail = response.statusText || `HTTP ${response.status}`;
    }
    throw new ApiError(errorDetail, response.status, data);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = Object.assign(requestFn, {
  get: <T>(endpoint: string, options: RequestOptions = {}) =>
    requestFn<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options: RequestOptions = {}) =>
    requestFn<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options: RequestOptions = {}) =>
    requestFn<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options: RequestOptions = {}) =>
    requestFn<T>(endpoint, { ...options, method: 'DELETE' }),
});
