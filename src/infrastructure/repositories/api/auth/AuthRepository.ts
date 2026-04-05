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

  /**
   * Logs out the user by invalidating the token.
   */
  static async logout() {
    // await ErrorHandler.handleApiErrors(() =>
    //   authenticatedClientHTTP.post('/auth/logout')
    // ); //TODO: Implement this in the backend
    console.log('Dummy function: Invalidating token...');
  }
}
