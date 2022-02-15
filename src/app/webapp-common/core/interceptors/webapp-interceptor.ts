import {Injectable} from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {catchError} from 'rxjs/operators';
import { Router } from '@angular/router';
import {selectCurrentUser} from '../reducers/users-reducer';
import {Store} from '@ngrx/store';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';
import {setCurrentUser} from '~/core/actions/users.action';

@Injectable()
export class WebappInterceptor implements HttpInterceptor {
  protected user: GetCurrentUserResponseUserObject;

  constructor(protected router: Router, protected store: Store<any>) {
    this.store.select(selectCurrentUser).subscribe(user => this.user = user);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'X-Allegro-Client': 'Webapp-' + environment.version,
      }
    });

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => this.errorHandler(request, err))
    );
  }

  protected errorHandler(request: HttpRequest<any>, err: HttpErrorResponse) {
    const redirectUrl: string = window.location.pathname + window.location.search;
    if (request.url.endsWith('system.company_info')) {
      return throwError(err);
    }
    // For automatic login don't go to login page (login in APP_INITIALIZER)
    if (err.status === 401 && (
      ['/dashboard'].includes(redirectUrl) ||
      !environment.autoLogin ||
      (environment.autoLogin && this.user)
    )) {
      if (redirectUrl.indexOf('/signup') > -1) {
      } else if (redirectUrl.indexOf('/login') === -1) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.store.dispatch(setCurrentUser({user: null, terms_of_use: null}));
        this.router.navigate(['login'], {queryParams: {redirect: redirectUrl}, replaceUrl: true});
      }
      return throwError(err);
    } else {
      return throwError(err);
    }
  }
}
