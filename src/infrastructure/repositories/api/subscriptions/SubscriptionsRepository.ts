import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';
import type {
  ISubscriptionDashboardResp,
  ISubscriptionPlansResp,
  ISubscriptionPlanResp,
  IStoreSubscriptionsResp,
  IStoreSubscriptionResp,
  ISubscriptionPlan,
} from '@/application/dtos/subscriptions/SubscriptionResponse';

export interface IRegisterPaymentDto {
  storeId: string;
  planId: string;
  startDate: string;
  endDate: string;
  paidAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'OTHER';
  notes?: string;
  status?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface ICreatePlanDto {
  name: string;
  description?: string;
  priceMonthly: number;
  durationDays: number;
  isActive?: boolean;
}

export class SubscriptionsRepository {
  static async getDashboard(): Promise<ISubscriptionDashboardResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISubscriptionDashboardResp>('/subscriptions/admin-dashboard'),
    );
  }

  static async getPlans(): Promise<ISubscriptionPlansResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ISubscriptionPlansResp>('/subscriptions/plans'),
    );
  }

  static async createPlan(dto: ICreatePlanDto): Promise<ISubscriptionPlanResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ISubscriptionPlanResp>('/subscriptions/plans', dto),
    );
  }

  static async updatePlan(id: string, dto: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlanResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<ISubscriptionPlanResp>(`/subscriptions/plans/${id}`, dto),
    );
  }

  static async getStoreSubscriptions(storeId: string): Promise<IStoreSubscriptionsResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IStoreSubscriptionsResp>(`/subscriptions/stores/${storeId}`),
    );
  }

  static async registerPayment(dto: IRegisterPaymentDto): Promise<IStoreSubscriptionResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IStoreSubscriptionResp>('/subscriptions', dto),
    );
  }

  static async cancelSubscription(id: string): Promise<IStoreSubscriptionResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IStoreSubscriptionResp>(`/subscriptions/${id}/cancel`, {}),
    );
  }
}
