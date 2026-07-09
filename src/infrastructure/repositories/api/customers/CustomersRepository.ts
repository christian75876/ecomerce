import {
  ICreateCustomerRequest,
  IRegisterCustomerPaymentRequest,
  IUpdateCustomerRequest,
} from '@/application/dtos/customers/request/CustomerRequest';
import {
  ICustomerCreditResp,
  ICustomerResp,
  ICustomersResp,
} from '@/application/dtos/customers/response/CustomerResponse';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class CustomersRepository {
  static async getCustomers(search?: string): Promise<ICustomersResp> {
    const suffix = search ? `?search=${encodeURIComponent(search)}` : '';
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICustomersResp>(`/customers${suffix}`),
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

  static async getCustomerCredit(id: string): Promise<ICustomerCreditResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICustomerCreditResp>(`/customers/${id}/credit`),
    );
  }

  static async registerCustomerPayment(
    id: string,
    payload: IRegisterCustomerPaymentRequest,
  ): Promise<ICustomerCreditResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICustomerCreditResp>(
        `/customers/${id}/payments`,
        payload,
      ),
    );
  }
}
