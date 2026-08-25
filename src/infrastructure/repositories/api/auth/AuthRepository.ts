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
import { IRegisterRequest } from '@/application/dtos/auth/register/register/RegisterRequest';
import { IRegisterResp } from '@/application/dtos/auth/register/response/RegisterResponse';
import { IRegisterCustomerRequest } from '@/application/dtos/auth/register/customer/RegisterCustomerRequest';
import { IRegisterCustomerResp } from '@/application/dtos/auth/register/customer/RegisterCustomerResponse';
import { IVerifyEmailRequest } from '@/application/dtos/auth/verify-email/request/VerifyEmailRequest';
import { IVerifyEmailResp } from '@/application/dtos/auth/verify-email/response/VerifyEmailResponse';
import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export class AuthRepository {
  /**
   * Handles user login.
   * @param {LoginRequest} credentials - User login data.
   * @returns {Promise<AuthResponse>} - The authenticated user and token.
   */
  static async login(credentials: ILoginRequest): Promise<ILoginResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<ILoginResp>('/auth/login', credentials),
      // Sin toast global: el formulario ya muestra el error inline.
      () => {},
    );
  }

  static async register(userData: IRegisterRequest): Promise<IRegisterResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<IRegisterResp>('/auth/register', userData),
      () => {},
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
      // Sin toast global: el formulario ya muestra el error inline.
      () => {},
    );
  }

  static async verifyEmail(
    payload: IVerifyEmailRequest
  ): Promise<IVerifyEmailResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<IVerifyEmailResp>('/auth/verify-email', payload),
      () => {},
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
      authenticatedClientHTTP.post<IApiResponse<{ token: string }>>('/auth/refresh', {})
    );
    const newToken = response.data?.token;
    if (!newToken) throw new Error('refresh_empty');
    localStorage.setItem('token', newToken);
    return newToken;
  }

  /**
   * Logs out the user by invalidating the token.
   */
  static async logout() {
    await ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.post('/auth/logout'),
      // Un 401 aquí solo significa "ya no había sesión" — no debe mostrar toast.
      () => {},
    );
  }

  static async requestPasswordRecovery(email: string): Promise<{ message: string }> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<{ message: string }>('/auth/recover-passwords', { email }),
      () => {},
    );
  }

  static async verifyRecoveryOtp(email: string, code: string): Promise<{ message: string }> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<{ message: string }>('/auth/recover-passwords/verify-otp', { email, code }),
      () => {},
    );
  }

  static async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<{ message: string }>('/auth/recover-passwords/reset', { email, code, newPassword }),
      () => {},
    );
  }
}
