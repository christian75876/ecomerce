import { IRolesResponse } from '@/application/dtos/users/response/RolesResponse';
import { ErrorHandler } from '../errors/ErrorHandler';
import { authenticatedClientHTTP, publicClientHTTP } from '../ClientHTTP';
import { logError } from '../errors/ErrorLogger';
import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IAdminUser {
  id: number;
  email: string;
  role: string | null;
  roleId: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface IAdminUsersPage {
  items: IAdminUser[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export class UsersRepository {
  static async getRoles(): Promise<IRolesResponse> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.get<IRolesResponse>('/user/roles'),
      msg => {
        logError(msg, 'client'); //TODO: Check if this message is showing correctly
      }
    );
  }

  // ── Admin CRUD ───────────────────────────────────────────────────────────

  static async getAllRolesAdmin() {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IApiResponse<{ id: string; name: string }[]>>('/users/roles'),
    );
  }

  static async getAllUsers(page = 1, limit = 20) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IApiResponse<IAdminUsersPage>>('/users', {
        params: { page, limit },
      }),
    );
  }

  static async createUser(payload: { email: string; password: string; roleId: string }) {
    return ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.post<IApiResponse<IAdminUser>>('/users', payload),
      () => {},
    );
  }

  static async updateUser(id: number, payload: { roleId?: string; isEmailVerified?: boolean }) {
    return ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.patch<IApiResponse<IAdminUser>>(`/users/${id}`, payload),
      () => {},
    );
  }

  static async deleteUser(id: number) {
    return ErrorHandler.handleApiErrors(
      () => authenticatedClientHTTP.delete<IApiResponse<{ message: string }>>(`/users/${id}`),
      () => {},
    );
  }
}
