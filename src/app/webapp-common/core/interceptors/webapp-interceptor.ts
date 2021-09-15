import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {catchError} from 'rxjs/operators';
import { Router } from '@angular/router';
import {selectCurrentUser, selectActiveWorkspace, selectSelectedWorkspaceTab} from '../reducers/users-reducer';
import {Store} from '@ngrx/store';
import {GetCurrentUserResponseUserObject} from 'app/business-logic/model/users/getCurrentUserResponseUserObject';
import {GetCurrentUserResponseUserObjectCompany} from 'app/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {setCurrentUser} from 'app/core/actions/users.action';

@Injectable()
export class WebappInterceptor implements HttpInterceptor {
  private user: GetCurrentUserResponseUserObject;
  private workspace: GetCurrentUserResponseUserObjectCompany;
  private selectedWorkspaceTab: GetCurrentUserResponseUserObjectCompany;
  private communityServer = false;

  constructor(private router: Router, private store: Store<any>, private confService: ConfigurationService) {
    this.store.select(selectCurrentUser).subscribe(user => this.user = user);
    this.store.select(selectActiveWorkspace).subscribe(workspace => this.workspace = workspace);
    this.store.select(selectSelectedWorkspaceTab).subscribe(workspace => this.selectedWorkspaceTab = workspace);
    confService.getEnvironment().subscribe(env => this.communityServer = env.communityServer);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let tenant;
    if (request.url.endsWith('organization.create_invite')
      || request.url.endsWith('users.set_preferences')
      || request.url.endsWith('auth.get_credentials')
      || request.url.endsWith('organization.get_user_companies')
      || request.url.endsWith('users.get_current_user')) {
  tenant = '';
    } else if (
      this.communityServer && (
        request.url.endsWith('login.leave_company') ||
        request.url.endsWith('auth.create_credentials') ||
        request.url.endsWith('auth.revoke_credentials'))) {
      tenant = this.selectedWorkspaceTab?.id;
    } else {
      tenant = this.workspace?.id || this.user?.company?.id || '';
    }
    request = request.clone({
      setHeaders: {
        'X-Allegro-Client': 'Webapp-' + environment.version,
        'X-Allegro-Tenant': tenant
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
          if (redirectUrl.indexOf('/signup') > -1) {
          } else if (redirectUrl.indexOf('/login') === -1) {
            this.store.dispatch(setCurrentUser({user: null, terms_of_use: null }));
            this.router.navigate(['login'], {queryParams: {redirect: redirectUrl}, replaceUrl: true});
          }
          return throwError(err);
        } else {
          return throwError(err);
        }
      })
    );
  }
}
