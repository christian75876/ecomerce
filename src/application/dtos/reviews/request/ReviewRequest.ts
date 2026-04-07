export interface ICreateReviewRequest {
  rating: number;
  comment: string;
  images?: File[];
}
