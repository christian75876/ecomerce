import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export type IRegisterResp = IApiResponse<{
  message: string;
}>;
