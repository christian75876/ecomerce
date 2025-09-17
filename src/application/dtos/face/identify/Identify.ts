export interface IFaceIdentifyRequest {
  descriptor: number[];
  threshold?: number;
  k?: number;
}

export interface IFaceIdentifyResponse {
  match: boolean;
  score: number;
  user: { id: number; email: string; role_id: number } | null;
  topk?: Array<{ userId: number; dist: number }>;
}
