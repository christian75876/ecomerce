import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import type { IApiResponse } from '@/application/dtos/common/HttpResponse';
import type {
  ISubscriptionAdminDashboard,
  ISubscriptionPlan,
  IStoreSubscription,
} from '@/application/dtos/subscriptions/response/SubscriptionResponse';
import type {
  IRegisterSubscriptionRequest,
  ICreatePlanRequest,
} from '@/application/dtos/subscriptions/request/SubscriptionRequest';

type SubscriptionDashboardResp = IApiResponse<ISubscriptionAdminDashboard>;
type PlansResp = IApiResponse<ISubscriptionPlan[]>;
type PlanResp = IApiResponse<ISubscriptionPlan>;
type SubsResp = IApiResponse<IStoreSubscription[]>;
type SubResp = IApiResponse<IStoreSubscription>;

export class SubscriptionsRepository {
  static async getAdminDashboard(): Promise<SubscriptionDashboardResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<SubscriptionDashboardResp>('/subscriptions/admin-dashboard'),
    );
  }

  static async getPlans(): Promise<PlansResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<PlansResp>('/subscriptions/plans'),
    );
  }

  static async createPlan(payload: ICreatePlanRequest): Promise<PlanResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<PlanResp>('/subscriptions/plans', payload),
    );
  }

  static async updatePlan(id: string, payload: Partial<ICreatePlanRequest>): Promise<PlanResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<PlanResp>(`/subscriptions/plans/${id}`, payload),
    );
  }

  static async getStoreSubscriptions(storeId: string): Promise<SubsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<SubsResp>(`/subscriptions/stores/${storeId}`),
    );
  }

  static async registerPayment(payload: IRegisterSubscriptionRequest): Promise<SubResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<SubResp>('/subscriptions', payload),
    );
  }

  static async cancelSubscription(id: string): Promise<SubResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<SubResp>(`/subscriptions/${id}/cancel`, {}),
    );
  }
}
