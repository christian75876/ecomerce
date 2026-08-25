import { authenticatedClientHTTP, publicClientHTTP } from '../ClientHTTP';
import { ErrorHandler } from '../errors/ErrorHandler';
import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IInvitation {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  invitedBy: number;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export class InvitationsRepository {
  static async create(email: string) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IApiResponse<{ message: string; email: string; emailSent: boolean }>>(
        '/invitations',
        { email },
      ),
    );
  }

  static async getAll() {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IApiResponse<IInvitation[]>>('/invitations'),
    );
  }

  static async resend(id: string) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IApiResponse<{ message: string; email: string; emailSent: boolean }>>(
        `/invitations/${id}/resend`,
        {},
      ),
    );
  }

  static async delete(id: string) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.delete<{ message: string }>(`/invitations/${id}`),
    );
  }

  static async validateToken(token: string) {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IApiResponse<{ valid: boolean; email: string }>>(
        `/invitations/validate/${encodeURIComponent(token)}`,
      ),
    );
  }
}
