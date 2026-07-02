import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IAuthenticatedUser {
  id: number;
  email: string;
  role_id: string;
  role?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
}

export type ILoginResp = IApiResponse<{
  message: string;
  token: string;
  user: IAuthenticatedUser;
}>;

export type IAuthMeResp = IApiResponse<IAuthenticatedUser>;
