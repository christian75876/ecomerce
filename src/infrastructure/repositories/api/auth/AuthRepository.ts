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
import type { IApiResponse } from '@/application/dtos/common/HttpResponse';

interface IRecoveryMessage {
  message: string;
  metadata?: {
    email_delivery?: 'sent' | 'failed';
  };
  otp_code?: string;
}

interface IVerifyRecoveryOtpRequest {
  email: string;
  code: string;
}

interface IResetPasswordRequest extends IVerifyRecoveryOtpRequest {
  newPassword: string;
}

export class AuthRepository {
  /**
   * Handles user login.
   * @param {LoginRequest} credentials - User login data.
   * @returns {Promise<AuthResponse>} - The authenticated user and token.
   */
  static async login(credentials: ILoginRequest): Promise<ILoginResp> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.post<ILoginResp>('/auth/login', credentials),
      msg => {
        logError(msg, 'client');
      }
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
      msg => {
        logError(msg, 'client');
      }
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

  static async requestPasswordRecovery(
    email: string,
  ): Promise<IApiResponse<IRecoveryMessage>> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<IApiResponse<IRecoveryMessage>>(
        '/auth/recover-passwords',
        { email },
      ),
    );
  }

  static async verifyRecoveryOtp(
    payload: IVerifyRecoveryOtpRequest,
  ): Promise<IApiResponse<{ message: string }>> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<IApiResponse<{ message: string }>>(
        '/auth/recover-passwords/verify-otp',
        payload,
      ),
    );
  }

  static async resetPassword(
    payload: IResetPasswordRequest,
  ): Promise<IApiResponse<{ message: string }>> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<IApiResponse<{ message: string }>>(
        '/auth/recover-passwords/reset',
        payload,
      ),
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

  /**
   * Logs out the user by invalidating the token.
   */
  static async logout() {
    await ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post('/auth/logout')
    );
  }
}
