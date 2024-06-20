import {Component, inject} from '@angular/core';
import {headerActions} from '@common/core/actions/router.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'sm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../webapp-common/settings/settings.component.scss']
})
export class SettingsComponent {
private store = inject(Store)
  constructor() {
    this.store.dispatch(headerActions.setTabs({contextMenu: null}));
  }

}
