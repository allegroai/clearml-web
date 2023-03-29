import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SmApiRequestsService} from '../../../business-logic/api-services/api-requests.service';
import {catchError, map} from 'rxjs/operators';
import {ConfigurationService} from '../../shared/services/configuration.service';


@Injectable()
export class AuthService {

  constructor(private apiRequest: SmApiRequestsService) {
  }

  public isAuthenticated(): Observable<boolean> {
    // for localhost...
    const environment = ConfigurationService.globalEnvironment;
    if (!environment.production) {
      return of(true);
    }

    return this.apiRequest.createRequest({meta: {method: 'GET', endpoint: 'debug.ping_auth'}})
      .pipe(
        map(res => res.meta.result_code !== 401),
        catchError(err => of(err.status !== 401))
      );
  }
}
