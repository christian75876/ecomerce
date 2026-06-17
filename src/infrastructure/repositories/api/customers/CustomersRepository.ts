import {
  ICreateCustomerRequest,
  IGetCustomersQuery,
  IRegisterCustomerPaymentRequest,
  IUpdateCustomerRequest,
} from '@/application/dtos/customers/request/CustomerRequest';
import {
  ICustomerCreditResp,
  ICustomerResp,
  ICustomersResp,
} from '@/application/dtos/customers/response/CustomerResponse';
import {
  authenticatedClientHTTP,
} from '@/infrastructure/repositories/api/ClientHTTP';
import { ErrorHandler } from '@/infrastructure/repositories/api/errors/ErrorHandler';

export class CustomersRepository {
  static async getCustomers(
    query: IGetCustomersQuery = {},
  ): Promise<ICustomersResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICustomersResp>('/customers', {
        params: query,
      }),
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
    storeId?: string | null,
  ): Promise<ICustomerResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.patch<ICustomerResp>(`/customers/${id}`, payload, {
        params: storeId ? { storeId } : undefined,
      }),
    );
  }

  static async getCustomerCredit(
    id: string,
    storeId?: string | null,
  ): Promise<ICustomerCreditResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.get<ICustomerCreditResp>(`/customers/${id}/credit`, {
        params: storeId ? { storeId } : undefined,
      }),
    );
  }

  static async registerCustomerPayment(
    id: string,
    payload: IRegisterCustomerPaymentRequest,
    storeId?: string | null,
  ): Promise<ICustomerCreditResp> {
    return ErrorHandler.handleApiErrors(() =>
      authenticatedClientHTTP.post<ICustomerCreditResp>(
        `/customers/${id}/payments`,
        payload,
        { params: storeId ? { storeId } : undefined },
      ),
    );
  }
}
