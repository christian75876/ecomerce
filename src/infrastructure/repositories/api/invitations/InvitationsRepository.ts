import { authenticatedClientHTTP, publicClientHTTP } from '../ClientHTTP';
import { ErrorHandler } from '../errors/ErrorHandler';
import type { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IInvitation {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  invitedBy: number;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

interface IInvitationValidation {
  valid: boolean;
  email: string;
}

export class InvitationsRepository {
  static async create(email: string) {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<
        IApiResponse<{ message: string; email: string; emailSent: boolean; inviteUrl: string }>
      >('/invitations', { email }),
    );
  }

  static async getAll() {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IApiResponse<IInvitation[]>>('/invitations'),
    );
  }

  static async validateToken(token: string) {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<IApiResponse<IInvitationValidation>>(
        `/invitations/validate/${encodeURIComponent(token)}`,
      ),
    );
  }
}
