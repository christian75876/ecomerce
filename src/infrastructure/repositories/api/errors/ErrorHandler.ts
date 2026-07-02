import { AxiosError, AxiosResponse } from 'axios';
import { logError } from '@infrastructure/repositories/api/errors/ErrorLogger';
import { ERROR_MESSAGES } from '@infrastructure/repositories/api/errors/ErrorMessages';
import { handleUnauthorized } from '@infrastructure/repositories/api/errors/ErrorUtils';

/** Normalizes a backend message that may be a string, an array, or an array of {name,reason} objects */
function normalizeMessage(raw: unknown, fallback: string): string {
  if (!raw) return fallback;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'reason' in item) {
          return String((item as { reason: unknown }).reason);
        }
        return String(item);
      })
      .join(' · ');
  }
  return fallback;
}

export class ErrorHandler {
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
    const humanMessage = normalizeMessage(data?.message, message);

    if (errorCallback) {
      errorCallback(humanMessage);
    } else {
      switch (status) {
        case 400:
          logError(`Bad Request: ${humanMessage}`, 'client');
          break;
        case 401:
          logError(`Unauthorized: ${message}`, 'auth');
          handleUnauthorized();
          break;
        case 403:
          logError(`Forbidden: ${message}`, 'auth');
          break;
        case 404:
          logError(`Not Found: ${message}`, 'client');
          break;
        case 500:
          logError(`Server Error: ${message}`, 'server');
          break;
        default:
          logError(`Unhandled Error (${status}): ${message}`, 'unknown');
      }
    }

    return Promise.reject(new Error(humanMessage));
  }

  logError(`Unknown Error: ${String(error)}`, 'unknown');
  return Promise.reject(error);
}
