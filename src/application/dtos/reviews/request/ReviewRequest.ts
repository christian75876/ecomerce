export interface ICreateReviewRequest {
  rating: number;
  comment?: string;
  images?: File[];
}

export interface ICreateStoreReviewRequest {
  rating: number;
  comment?: string;
}
