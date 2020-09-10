import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {Observable} from 'rxjs';
import {User} from '../../../business-logic/model/users/user';
import {environment} from '../../../../environments/environment';
import {Logout} from '../../core/actions/users.actions';

@Component({
  selector   : 'sm-header',
  templateUrl: './header.component.html',
  styleUrls  : ['./header.component.scss']
})
export class HeaderComponent {
  @Input() isDashboard: boolean;
  @Input() isLogin: boolean;
  public user: Observable<User>;
  environment = environment;

  constructor(private store: Store<any>) {
    this.user = this.store.select(selectCurrentUser);
  }

  logout() {
    this.store.dispatch(new Logout());
  }
}
