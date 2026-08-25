import { IAuthenticatedUser } from '@/application/dtos/auth/login/response/LoginResponse';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'authenticated_user';

export const authSession = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(refreshToken: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getUser(): IAuthenticatedUser | null {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as IAuthenticatedUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser(user: IAuthenticatedUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(USER_KEY);
  },

  getTokenExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64)) as { exp?: number };
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  },

  clear() {
    this.clearToken();
    this.clearRefreshToken();
    this.clearUser();
  },
};
