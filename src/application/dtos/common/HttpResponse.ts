export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  metadata?: IMetaData | null;
}

export interface IMetaData {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
