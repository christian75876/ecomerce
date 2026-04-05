export interface ICreateReviewRequest {
  customerId: string;
  rating: number;
  comment: string;
  images?: File[];
}
