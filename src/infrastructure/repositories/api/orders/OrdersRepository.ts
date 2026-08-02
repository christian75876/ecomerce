import {
  ICreateOrderRequest,
  ISubmitPaymentRequest,
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

interface GetOrdersQuery {
  storeId?: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  paymentStatus?: string;
}

export class OrdersRepository {
  static async getOrders(params: GetOrdersQuery = {}): Promise<IOrdersResp> {
    const query = new URLSearchParams();
    if (params.storeId) query.set('storeId', params.storeId);
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<IOrdersResp>(`/orders${suffix}`),
    );
  }

  static async createOrder(payload: ICreateOrderRequest): Promise<IOrderResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<IOrderResp>('/orders', payload),
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

  static async submitPayment(id: string, payload: ISubmitPaymentRequest): Promise<IOrderResp> {
    const form = new FormData();
    if (payload.paymentMethodType) form.append('paymentMethodType', payload.paymentMethodType);
    if (payload.paymentReference) form.append('paymentReference', payload.paymentReference);
    if (payload.evidenceImage) form.append('evidenceImage', payload.evidenceImage);
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IOrderResp>(`/orders/${id}/payment`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  }

  static async confirmPayment(id: string): Promise<IOrderResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<IOrderResp>(`/orders/${id}/confirm-payment`, {}),
    );
  }
}
