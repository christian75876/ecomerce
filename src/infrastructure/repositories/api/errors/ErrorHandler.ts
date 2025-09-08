import { AxiosError, AxiosResponse } from 'axios';
import { logError } from '@infrastructure/repositories/api/errors/ErrorLogger';
import { ERROR_MESSAGES } from '@infrastructure/repositories/api/errors/ErrorMessages';
import { handleUnauthorized } from '@infrastructure/repositories/api/errors/ErrorUtils';

/**
 * Handles API errors in a structured way.
 */
export class ErrorHandler {
  /**
   * Wraps an API call with global error handling.
   * @param {() => Promise<AxiosResponse<T>>} apiCall - The API request.
   * @param {(msg: string) => void} [errorCallback] - Custom error handler.
   * @returns {Promise<T>} - The response data or a handled error.
   */
  static async handleApiErrors<T>(
    apiCall: () => Promise<AxiosResponse<T>>,
    errorCallback?: (msg: string) => void
  ): Promise<T> {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error) {
      return processError(error, errorCallback);
    }
  }
}

/**
 * Processes an API error and determines the appropriate response.
 */
async function processError(
  error: unknown,
  errorCallback?: (msg: string) => void
): Promise<never> {
  if (error instanceof AxiosError) {
    const { response, message } = error;

    if (!response) {
      logError(`Network Error: ${message}`, 'network');
      errorCallback?.(ERROR_MESSAGES.network);
      return Promise.reject(new Error(ERROR_MESSAGES.network));
    }

    const { status, data } = response;

    if (errorCallback) {
      errorCallback(data?.message || message);
    } else {
      switch (status) {
        case 400:
          logError(`Bad Request: ${data.message || message}`, 'client');
          // errorCallback?.(data.message || ERROR_MESSAGES.badRequest);
          break;
        case 401:
          logError(`Unauthorized: ${message}`, 'auth');
          // errorCallback?.(ERROR_MESSAGES.unauthorized);
          handleUnauthorized();
          break;
        case 403:
          logError(`Forbidden: ${message}`, 'auth');
          // errorCallback?.(ERROR_MESSAGES.forbidden);
          break;
        case 404:
          logError(`Not Found: ${message}`, 'client');
          // errorCallback?.(ERROR_MESSAGES.notFound);
          break;
        case 500:
          logError(`Server Error: ${message}`, 'server');
          // errorCallback?.(ERROR_MESSAGES.serverError);
          break;
        default:
          logError(`Unhandled Error: ${message}`, 'unknown');
        // errorCallback?.(ERROR_MESSAGES.unknown);
      }
    }

    return Promise.reject(new Error(data?.message || message));
  }

  logError(`Unknown Error: ${String(error)}`, 'unknown');
  return Promise.reject(error);
}
