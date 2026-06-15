import { publicClientHTTP, authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';

export interface IAppConfig {
  isAccessBlocked: boolean;
  blockedMessage: string | null;
  updatedAt: string;
}

export const AppConfigRepository = {
  async getConfig(): Promise<IAppConfig> {
    const res = await publicClientHTTP.get<IAppConfig>('/app-config');
    return res.data;
  },

  async updateConfig(payload: Partial<Pick<IAppConfig, 'isAccessBlocked' | 'blockedMessage'>>): Promise<IAppConfig> {
    const res = await authenticatedClientHTTP.patch<IAppConfig>('/app-config', payload);
    return res.data;
  },
};
