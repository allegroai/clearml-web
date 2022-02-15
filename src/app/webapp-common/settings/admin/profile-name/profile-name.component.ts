import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {filter, take} from 'rxjs/operators';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {getAllCredentials} from '@common/core/actions/common-auth.actions';
import {updateCurrentUser} from '@common/core/actions/users.actions';
import {GetCurrentUserResponseUserObject} from '../../../../business-logic/model/users/getCurrentUserResponseUserObject';

@Component({
  selector: 'sm-profile-name',
  templateUrl: './profile-name.component.html',
  styleUrls: ['./profile-name.component.scss']
})
export class ProfileNameComponent implements OnInit {

  currentUser$ = this.store.select(selectCurrentUser);

  constructor(private store: Store<any>) { }

  ngOnInit(): void {
    this.currentUser$
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => {
        this.store.dispatch(getAllCredentials());
      });
  }


  nameChange(updatedUserName: string, currentUser: GetCurrentUserResponseUserObject) {
    const user = {name: updatedUserName, user: currentUser.id};
    this.store.dispatch(updateCurrentUser({user}));
  }
}
