import { IApiResponse } from '../../common/HttpResponse';

export interface IFaceEnrollByRequest {
  userId: number;
  descriptors: number[][];
}

export type IFaceEnrollByResponse = IApiResponse<{
  enrollmentId: string;
  updated: boolean;
}>;
