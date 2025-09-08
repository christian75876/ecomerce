import { IApiResponse } from "@/application/dtos/common/HttpResponse";

export type IProductResp = IApiResponse<{ 
    product: string;
}>;