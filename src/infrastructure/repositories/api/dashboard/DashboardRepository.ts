import {
  IDashboardAnalyticsQuery,
  IDashboardAnalyticsResp,
} from '@/application/dtos/dashboard/response/DashboardResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class DashboardRepository {
  static async getAnalytics(
    query: IDashboardAnalyticsQuery,
  ): Promise<IDashboardAnalyticsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IDashboardAnalyticsResp>('/dashboard/analytics', {
        params: query,
      }),
    );
  }
}
