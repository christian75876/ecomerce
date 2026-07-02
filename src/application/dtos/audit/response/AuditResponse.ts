import { IApiResponse } from '@/application/dtos/common/HttpResponse';

export interface IAuditLog {
  id: string;
  userId: number | null;
  action: string;
  entity: string;
  referenceId: string | null;
  detail: string | null;
  createdAt: string;
}

export type IAuditLogsResp = IApiResponse<IAuditLog[]>;
