export interface SmHttpResponse {
  data: any;
  meta: any;
}

export interface IApiRequest {
  payload?: any;
  meta: IApiRequestMeta;
  params?: object;
}

export interface IApiRequestMeta {
  method: string;
  endpoint: string;
}
