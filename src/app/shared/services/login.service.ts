import {Injectable} from '@angular/core';
import {ApiLoginService} from '../../business-logic/api-services/login.service';
import {LoginSsoCallbackResponse} from '../../business-logic/model/login/loginSsoCallbackResponse';
import {LoginSsoCallbackRequest} from '../../business-logic/model/login/loginSsoCallbackRequest';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {userState} from '../../webapp-common/shared/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private loginApi: ApiLoginService) { }

  ssoLogin(params: Partial<LoginSsoCallbackRequest>): userState {
    const url = new URL(window.location.href);
    const provider = url.pathname.slice(10);
    const args = {};
    url.searchParams.forEach(((value, key) => args[key] = value));
    const state = url.searchParams.get('state');
    const callback = `${url.origin}/callback_${provider}`;
    return (this.loginApi.loginSsoCallback({provider, args, callback_url: callback, ...params}) as Observable<LoginSsoCallbackResponse>)
      .pipe(map((res) => ({userState: res, state})));
  }
}
