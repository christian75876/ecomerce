//infrastructure Imports
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import {
  publicClientHTTP,
  authenticatedClientHTTP
} from '@/infrastructure/repositories/api/ClientHTTP';
//application Imports
import { ILoginRequest } from '@/application/dtos/auth/login/request/LoginRequest';
import { ILoginResp } from '@/application/dtos/auth/login/response/LoginResponse';
import { logError } from '../errors/ErrorLogger';
import { IRegisterRequest } from '@/application/dtos/auth/register/register/RegisterRequest';
import { IRegisterResp } from '@/application/dtos/auth/register/response/RegisterResponse';

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

  /**
   * Fetches the authenticated user data.
   * @returns {Promise<AuthResponse>} - The authenticated user details.
   */
  static async getAuthenticatedUser(): Promise<ILoginResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ILoginResp>('/auth/me')
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
    localStorage.removeItem('token');
  }
}
