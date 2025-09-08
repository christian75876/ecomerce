import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export type ILoginResp = IApiResponse<{
  message: string;
  token: string;
}>;
