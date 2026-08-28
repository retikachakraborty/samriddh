import { apiClient, clearStoredTokens, setStoredRefreshToken, setStoredToken } from './client';
import type { AuthSession, AuthUser } from '../types/api';

export interface SigninCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export async function signinApi(credentials: SigninCredentials): Promise<AuthSession> {
  const data = await apiClient<any>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });

  if (data.access_token) {
    setStoredToken(data.access_token);
    if (data.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }
  }

  const user: AuthUser = {
    id: data.user?.id || data.id || 'usr_default',
    email: data.user?.email || data.email || credentials.email,
    role: data.user?.role || data.role || 'authenticated',
  };

  const session: AuthSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
    user,
  };

  localStorage.setItem('samriddh_user', JSON.stringify(user));
  return session;
}

export async function signupApi(credentials: SignupCredentials): Promise<any> {
  return apiClient<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export async function getCurrentUserApi(): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/me', {
    method: 'GET',
  });
}

export async function signoutApi(): Promise<void> {
  try {
    await apiClient<void>('/auth/signout', {
      method: 'POST',
    });
  } catch (err) {
    // Ignore signout error and clear local storage anyway
  } finally {
    clearStoredTokens();
  }
}
