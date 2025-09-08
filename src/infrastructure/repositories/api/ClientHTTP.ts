import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
        baseURL: config.baseURL || 'http://127.0.0.1:3400/api/',
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
