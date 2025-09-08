import { IRolesResponse } from '@/application/dtos/users/response/RolesResponse';
import { ErrorHandler } from '../errors/ErrorHandler';
import { publicClientHTTP } from '../ClientHTTP';
import { logError } from '../errors/ErrorLogger';

export class UsersRepository {
  static async getRoles(): Promise<IRolesResponse> {
    return ErrorHandler.handleApiErrors(
      () => publicClientHTTP.get<IRolesResponse>('user/roles'),
      msg => {
        logError(msg, 'client'); //TODO: Check if this message is showing correctly
      }
    );
  }
}
