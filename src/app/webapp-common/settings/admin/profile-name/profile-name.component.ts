import {ChangeDetectionStrategy, Component, effect, signal, untracked} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {getAllCredentials} from '@common/core/actions/common-auth.actions';
import {updateCurrentUser} from '@common/core/actions/users.actions';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';
import {addMessage} from '@common/core/actions/layout.actions';

@Component({
  selector: 'sm-profile-name',
  templateUrl: './profile-name.component.html',
  styleUrls: ['./profile-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileNameComponent {

  currentUser = this.store.selectSignal(selectCurrentUser);
  active = signal(false);

  constructor(private store: Store) {
    effect(() => {
      if (this.currentUser()) {
        untracked(() => this.store.dispatch(getAllCredentials({})));
      }
    });
  }

  nameChange(updatedUserName: string, currentUser: GetCurrentUserResponseUserObject) {
    const user = {name: updatedUserName, user: currentUser.id};
    this.store.dispatch(updateCurrentUser({user}));
  }
  copyToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }
}
