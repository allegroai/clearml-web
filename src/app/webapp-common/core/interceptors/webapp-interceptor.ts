import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {catchError, take} from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class WebappIntercptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'X-Allegro-Client': 'Webapp-' + environment.version
      }
    });
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        const redirectUrl: string = window.location.pathname + window.location.search;
        if(request.url.endsWith('system.company_info')){
          return throwError(err);
        }
        // For automatic login don't go to login page (login in APP_INITIALIZER)
        if (err.status === 401 && (['/dashboard'].includes(redirectUrl) || !environment.autoLogin)) {
          if (redirectUrl.indexOf('/login') === -1) {
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
