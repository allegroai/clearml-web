import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map, switchMap} from 'rxjs/operators';
import {getTOU, setTOU} from './login.actions';
import {ApiUsersService} from '../../business-logic/api-services/users.service';


@Injectable()
export class LoginEffects {


  constructor(private actions$: Actions, private userService: ApiUsersService) {
  }

  getTOU = createEffect(() => this.actions$.pipe(
    ofType(getTOU),
    switchMap(() => this.userService.usersGetTermsOfUse({})),
    map((res) => setTOU({terms: res.terms_of_use.text}))
  ));
}
