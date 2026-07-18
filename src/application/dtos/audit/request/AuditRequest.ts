export interface IAuditQuery {
  action?: string;
  entity?: string;
  userId?: string;
  page?: number;
  limit?: number;
}
