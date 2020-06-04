import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {Observable} from 'rxjs';
import {User} from '../../../business-logic/model/users/user';

@Component({
  selector   : 'sm-header',
  templateUrl: './header.component.html',
  styleUrls  : ['./header.component.scss']
})
export class HeaderComponent {
  @Input() isDashboard: boolean;
  public user: Observable<User>;

  constructor(private store: Store<any>) {
    this.user = this.store.select(selectCurrentUser);
  }
}
