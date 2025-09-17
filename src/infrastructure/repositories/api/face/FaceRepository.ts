import {
  IFaceEnrollByRequest,
  IFaceEnrollByResponse
} from '@/application/dtos/face/enroll/EnrollById';
import { ErrorHandler } from '../errors/ErrorHandler';
import { publicClientHTTP } from '../ClientHTTP';
import { logError } from '../errors/ErrorLogger';
import {
  IFaceIdentifyRequest,
  IFaceIdentifyResponse
} from '@/application/dtos/face/identify/Identify';

export class FaceRepository {
  static async enrollById(
    body: IFaceEnrollByRequest
  ): Promise<IFaceEnrollByResponse> {
    return ErrorHandler.handleApiErrors(
      () =>
        publicClientHTTP.post<IFaceEnrollByResponse>(
          '/face/enroll-by-id',
          body
        ),
      msg => logError(msg, 'client')
    );
  }

  static async identify(
    body: IFaceIdentifyRequest
  ): Promise<IFaceIdentifyResponse> {
    return ErrorHandler.handleApiErrors(
      () =>
        publicClientHTTP.post<IFaceIdentifyResponse>('/face/identify', body),
      msg => logError(msg, 'client')
    );
  }
}
