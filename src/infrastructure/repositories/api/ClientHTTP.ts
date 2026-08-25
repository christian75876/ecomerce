import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { handleUnauthorized } from '@/infrastructure/repositories/api/errors/ErrorUtils';

// Shared refresh state — prevents duplicate refresh calls across concurrent
// 401s AND across the proactive background refresh in useTokenRefresh.ts.
// This matters now that refresh tokens rotate (single-use): two refresh
// calls racing with the same stored refresh token would have one succeed
// and one get rejected as "already used", logging the user out even though
// the session is actually still fine.
let isRefreshing = false;
let refreshQueue: Array<(newToken: string | null) => void> = [];
let refreshInFlight: Promise<string> | null = null;

function flushRefreshQueue(newToken: string | null) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

/**
 * Rotates the stored refresh token for a new access + refresh pair. Callers
 * that just need a valid access token (not axios-request retry semantics)
 * should use this instead of talking to AuthRepository directly.
 */
export async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('no_refresh_token');
    const res = await axios.post(
      `${ClientHTTP.defaultBaseURL}auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const data = res.data?.data ?? res.data;
    const newToken: string | undefined = data?.token;
    const newRefreshToken: string | undefined = data?.refreshToken;
    if (!newToken || !newRefreshToken) throw new Error('refresh_empty');
    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    return newToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

/**
 * Configuration options for creating an HTTP client.
 */
interface HttpClientConfig {
  baseURL?: string;
  auth?: boolean;
  json?: boolean;
}

/**
 * Singleton + Factory Pattern for managing Axios clients.
 */
class ClientHTTP {
  private static instances = new Map<string, AxiosInstance>();

  private static ensureProtocol(url: string): string {
    if (!/^https?:\/\//i.test(url)) return `https://${url}`;
    return url;
  }

  private static normalizeBaseURL(url: string): string {
    const safe = ClientHTTP.ensureProtocol(url);
    return safe.endsWith('/') ? safe : `${safe}/`;
  }

  // Accepts VITE_API_URL (local .env) or VITE_API_BASE_URL (Vercel)
  static defaultBaseURL = this.normalizeBaseURL(
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:3000/api/'
  );

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {}

  /**
   * Returns an Axios instance based on the given configuration.
   * @param {HttpClientConfig} config - Configuration options for the HTTP client.
   * @returns {AxiosInstance} - The Axios instance.
   */
  static getInstance(config: HttpClientConfig = {}): AxiosInstance {
    const key = JSON.stringify(config); // Unique key per configuration

    if (!this.instances.has(key)) {
      const instance = axios.create({
        baseURL: this.normalizeBaseURL(config.baseURL || this.defaultBaseURL),
        headers: {
          'Content-Type': config.json
            ? 'application/json'
            : 'multipart/form-data'
        }
      });

      if (config.auth) {
        instance.interceptors.request.use(this.requestInterceptor, error =>
          Promise.reject(error)
        );
        instance.interceptors.response.use(
          (res) => res,
          (error: AxiosError) => ClientHTTP.responseErrorInterceptor(error),
        );
      }

      this.instances.set(key, instance);
    }

    return this.instances.get(key)!;
  }

  /**
   * Request interceptor for adding authorization headers.
   * @param {InternalAxiosRequestConfig} config - Axios internal request configuration.
   * @returns {InternalAxiosRequestConfig} - Modified request configuration.
   */
  private static requestInterceptor(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private static async responseErrorInterceptor(error: AxiosError): Promise<unknown> {
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !config || config._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) return reject(error);
          config.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(axios(config));
        });
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      config.headers['Authorization'] = `Bearer ${newToken}`;
      flushRefreshQueue(newToken);
      return axios(config);
    } catch {
      flushRefreshQueue(null);
      handleUnauthorized();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }

  /**
   * Clears all stored instances (useful for logout).
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}

// Export predefined instances
export const publicClientHTTP = ClientHTTP.getInstance({
  auth: false,
  json: true
});
export const authenticatedClientHTTP = ClientHTTP.getInstance({
  auth: true,
  json: true
});
export const multiPartClientHTTP = ClientHTTP.getInstance({
  auth: true,
  json: false
});

/**
 * Factory method to create a new instance with a dynamic `baseURL`
 */
export const createCustomClient = (
  baseURL: string,
  auth: boolean = false,
  json: boolean = true
) => {
  return ClientHTTP.getInstance({ baseURL, auth, json });
};
