import { Injectable } from '@angular/core';
import {HTTP} from '../../../app.constants';
import {Observable} from 'rxjs';
import {IApiRequest} from '../models/api-request';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable()
export class SmApiRequestsService {

  constructor(private http: HttpClient) { }

  createRequest(request: IApiRequest): Observable<any> {

    return this.http.request(
      request.meta.method,
      request.meta.endpoint[0] === '/' ? request.meta.endpoint : `${HTTP.API_BASE_URL}/${request.meta.endpoint}`,
      {
        params: this.getParams(request.params),
        body           : request.payload,
        withCredentials: true
      });
  }

  private getParams(actionParams) {
    let params: HttpParams = new HttpParams();

    if (actionParams) {
      Object.keys(actionParams)
        .forEach(key => params = params.append(key, actionParams[key]));
    }

    return params;
  }
}
