import { IApiResponse } from '@/application/dtos/common/HttpResponse';
import { IAuthenticatedUser } from '@/application/dtos/auth/login/response/LoginResponse';

export type IRegisterCustomerResp = IApiResponse<{
  message: string;
  token: string;
  user: IAuthenticatedUser;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
}>;
