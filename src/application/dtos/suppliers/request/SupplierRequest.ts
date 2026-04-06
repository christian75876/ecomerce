export interface ICreateSupplierRequest {
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface IUpdateSupplierRequest extends Partial<ICreateSupplierRequest> {
  isActive?: boolean;
}
