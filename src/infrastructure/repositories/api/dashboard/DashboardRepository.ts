import { IDashboardSummaryResp } from '@/application/dtos/dashboard/response/DashboardResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class DashboardRepository {
  static async getSummary(): Promise<IDashboardSummaryResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IDashboardSummaryResp>('/dashboard/summary'),
    );
  }
}
