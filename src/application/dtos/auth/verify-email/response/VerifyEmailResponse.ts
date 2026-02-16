import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export type IVerifyEmailResp = IApiResponse<{
  message: string;
}>;
