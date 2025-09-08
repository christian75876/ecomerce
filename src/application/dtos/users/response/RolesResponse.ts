import { IApiResponse } from '../../common/HttpResponse';

export type IRole = {
  id: string;
  name: string;
};

export type IRolesResponse = IApiResponse<IRole[]>;
