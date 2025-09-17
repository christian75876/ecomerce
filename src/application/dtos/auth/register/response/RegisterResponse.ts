import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export type IRegisterResp = IApiResponse<{
  id: number;
  email: string;
  role_id: number;
  message: string;
}>;
