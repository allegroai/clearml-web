import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {EMPTY} from 'rxjs';
import {ApiLoginService} from '~/business-logic/api-services/login.service';
import {BaseLoginService} from '@common/shared/services/login.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {UserPreferences} from '@common/user-preferences';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseLoginService {

  constructor(
    protected httpClient: HttpClient,
    protected loginApi: ApiLoginService,
    protected dialog: MatDialog,
    protected configService: ConfigurationService,
    protected store: Store,
    protected router: Router,
    protected userPreferences: UserPreferences
) {
    super(httpClient, loginApi, dialog, configService, store, router, userPreferences);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signup(signupInfo) {
    return EMPTY;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getInviteInfo(inviteId: string) {
    return EMPTY;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ssoLogin(params) {
    return EMPTY;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ssoFlow(resolve) {
  }

}
