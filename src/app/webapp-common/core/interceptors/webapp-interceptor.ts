import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {catchError} from 'rxjs/operators';
import { Router } from '@angular/router';
import {selectCurrentUser} from '../reducers/users-reducer';
import {Store} from '@ngrx/store';
import { setCurrentUser } from '../actions/users.actions';
import {User} from '../../../business-logic/model/users/user';

@Injectable()
export class WebappIntercptor implements HttpInterceptor {
  private user: User;

  constructor(private router: Router, private store: Store<any>) {
    this.store.select(selectCurrentUser).subscribe(user => this.user = user);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'X-Allegro-Client': 'Webapp-' + environment.version
      }
    });
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
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
          if (redirectUrl.indexOf('/login') === -1) {
            this.store.dispatch(setCurrentUser({user: null, terms_of_use: null }));
            this.router.navigate(['login'], {queryParams: {redirect: redirectUrl}});
          }
          return throwError(err);
        } else {
          return throwError(err);
        }
      })
    );
  }
}
