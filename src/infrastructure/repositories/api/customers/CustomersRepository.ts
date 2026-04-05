import {
  ICreateCustomerRequest,
  IUpdateCustomerRequest,
} from '@/application/dtos/customers/request/CustomerRequest';
import {
  ICustomerResp,
  ICustomersResp,
} from '@/application/dtos/customers/response/CustomerResponse';
import {
  authenticatedClientHTTP,
  publicClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class CustomersRepository {
  static async getCustomers(search?: string): Promise<ICustomersResp> {
    const suffix = search ? `?search=${encodeURIComponent(search)}` : '';
    return ErrorHandler.handleApiErrors(() =>
      publicClientHTTP.get<ICustomersResp>(`/customers${suffix}`),
    );
  }

  static async createCustomer(
    payload: ICreateCustomerRequest,
  ): Promise<ICustomerResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICustomerResp>('/customers', payload),
    );
  }

  static async updateCustomer(
    id: string,
    payload: IUpdateCustomerRequest,
  ): Promise<ICustomerResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<ICustomerResp>(`/customers/${id}`, payload),
    );
  }
}
