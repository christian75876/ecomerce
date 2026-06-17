import {
  ICreateOrderRequest,
  IUpdateOrderStatusRequest,
} from '@/application/dtos/orders/request/OrderRequest';
import {
  IOrderResp,
  IOrdersResp,
} from '@/application/dtos/orders/response/OrderResponse';
import {
  authenticatedClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class OrdersRepository {
  static async getOrders(storeId?: string | null): Promise<IOrdersResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IOrdersResp>('/orders', { params: storeId ? { storeId } : undefined }),
    );
  }

  static async createOrder(payload: ICreateOrderRequest): Promise<IOrderResp> {
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.post<IOrderResp>('/orders', payload),
    );
  }

  static async updateOrderStatus(
    id: string,
    payload: IUpdateOrderStatusRequest,
  ): Promise<IOrderResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IOrderResp>(`/orders/${id}/status`, payload),
    );
  }

  static async getMyOrders(): Promise<IOrdersResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IOrdersResp>('/orders/me'),
    );
  }

  static async getMyOrderById(id: string): Promise<IOrderResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IOrderResp>(`/orders/me/${id}`),
    );
  }
}
