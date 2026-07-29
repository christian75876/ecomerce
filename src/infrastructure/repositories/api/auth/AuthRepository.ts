//infrastructure Imports
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import {
  publicClientHTTP,
  authenticatedClientHTTP
} from '@/infrastructure/repositories/api/ClientHTTP';
//application Imports
import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import {
  IAuthMeResp,
  ILoginResp
} from '@/application/dtos/auth/login/response/LoginResponse';
import { logError } from '../errors/ErrorLogger';
import { IRegisterRequest } from '@/application/dtos/auth/register/register/RegisterRequest';
import { IRegisterResp } from '@/application/dtos/auth/register/response/RegisterResponse';
import { IRegisterCustomerRequest } from '@/application/dtos/auth/register/customer/RegisterCustomerRequest';
import { IRegisterCustomerResp } from '@/application/dtos/auth/register/customer/RegisterCustomerResponse';
import { IVerifyEmailRequest } from '@/application/dtos/auth/verify-email/request/VerifyEmailRequest';
import { IVerifyEmailResp } from '@/application/dtos/auth/verify-email/response/VerifyEmailResponse';

export class AuthRepository {
  /**
   * Handles user login.
   * @param {LoginRequest} credentials - User login data.
   * @returns {Promise<AuthResponse>} - The authenticated user and token.
   */
  static async login(credentials: ILoginRequest): Promise<ILoginResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<ILoginResp>('/auth/login', credentials),
    );
  }

  static async register(userData: IRegisterRequest): Promise<IRegisterResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<IRegisterResp>('/auth/register', userData),
      msg => {
        logError(msg, 'client');
      }
    );
  }

  static async registerCustomer(
    userData: IRegisterCustomerRequest,
  ): Promise<IRegisterCustomerResp> {
    return ErrorHandler.handleApiErrors(
      () =>
        publicClientHTTP.post<IRegisterCustomerResp>(
          '/auth/register-customer',
          userData,
        ),
    );
  }

  static async verifyEmail(
    payload: IVerifyEmailRequest
  ): Promise<IVerifyEmailResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<IVerifyEmailResp>('/auth/verify-email', payload),
      msg => {
        logError(msg, 'client');
      }
    );
  }

  /**
   * Fetches the authenticated user data.
   * @returns {Promise<AuthResponse>} - The authenticated user details.
   */
  static async getAuthenticatedUser(): Promise<IAuthMeResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IAuthMeResp>('/auth/me')
    );
  }

  static async updateMyProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<{ id: string; firstName: string; lastName: string; phone: string | null }> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch('/auth/me', payload)
    );
  }

  static async refreshToken(): Promise<string> {
    const response = await ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<{ token: string }>('/auth/refresh', {})
    );
    // response is the IApiResponse wrapper; actual token is at .data.token
    const newToken = (response as unknown as { data: { token: string } }).data?.token
      ?? (response as unknown as { token: string }).token;
    if (!newToken) throw new Error('refresh_empty');
    localStorage.setItem('token', newToken);
    return newToken;
  }

  /**
   * Logs out the user by invalidating the token.
   */
  static async logout() {
    await ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post('/auth/logout')
    );
  }

  static async requestPasswordRecovery(email: string): Promise<{ message: string }> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<{ message: string }>('/auth/recover-passwords', { email })
    );
  }

  static async verifyRecoveryOtp(email: string, code: string): Promise<{ message: string }> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<{ message: string }>('/auth/recover-passwords/verify-otp', { email, code })
    );
  }

  static async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<{ message: string }>('/auth/recover-passwords/reset', { email, code, newPassword })
    );
  }
}
