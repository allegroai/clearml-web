// src/app/auth/auth-guard.service.ts
import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {User} from '../../../business-logic/model/users/user';

@Injectable()
export class AuthGuard implements CanActivate {
  private user: User;

  constructor(
    public router: Router,
    public store: Store<any>) {
    this.store.select(selectCurrentUser).subscribe(user => {this.user = user; });
  }

  canActivate(): boolean {
    if (!this.user) {
      this.router.navigateByUrl('/login');
    }
    return !!this.user;
  }
}
