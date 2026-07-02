import { IAuditQuery } from '@/application/dtos/audit/request/AuditRequest';
import { IAuditLogsResp } from '@/application/dtos/audit/response/AuditResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class AuditRepository {
  static async getAuditLogs(query: IAuditQuery = {}): Promise<IAuditLogsResp> {
    const params = new URLSearchParams();

    if (query.action) params.set('action', query.action);
    if (query.entity) params.set('entity', query.entity);
    if (query.userId) params.set('userId', query.userId);

    const suffix = params.toString() ? `?${params.toString()}` : '';

    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IAuditLogsResp>(`/audit${suffix}`),
    );
  }
}
