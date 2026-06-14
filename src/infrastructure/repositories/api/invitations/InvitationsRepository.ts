import { authenticatedClientHTTP, publicClientHTTP } from '../ClientHTTP';
import { ErrorHandler } from '../errors/ErrorHandler';

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
      authenticatedClientHTTP.post<{ message: string; email: string; emailSent: boolean }>(
        '/invitations',
        { email },
      ),
    );
  }

  static async getAll() {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IInvitation[]>('/invitations'),
    );
  }

  static async validateToken(token: string) {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<{ valid: boolean; email: string }>(
        `/invitations/validate/${encodeURIComponent(token)}`,
      ),
    );
  }
}
