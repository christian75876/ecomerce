import { IPaginatedData } from './HttpResponse';

export interface IAsyncOption {
  id: string;
  label: string;
  secondary?: string | null;
  helper?: string | null;
  [key: string]: unknown;
}

export type IAsyncOptionsData = IPaginatedData<IAsyncOption>;
