import { IAuthenticatedUser } from '@/application/dtos/auth/login/response/LoginResponse';

const TOKEN_KEY = 'token';
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

  clear() {
    this.clearToken();
    this.clearUser();
  },
};
