import { selectCurrentUser } from './../../webapp-common/core/reducers/users-reducer';
import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectSelectedProjectId} from '../../webapp-common/core/reducers/projects.reducer';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {SearchDeactivate} from '../../webapp-common/search/common-search-results.actions';
import {ConfigurationService} from '../../webapp-common/shared/services/configuration.service';

@Component({
  selector   : 'sm-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls  : ['./side-nav.component.scss'],
})
export class SideNavComponent {
  public selectedProjectId$: Observable<any>;
  currentUser: any;
  environment = ConfigurationService.globalEnvironment;


  constructor(public store: Store<any>, private router: Router) {
    this.selectedProjectId$ = this.store.select(selectSelectedProjectId);
    this.store.select(selectCurrentUser).subscribe((res) => this.currentUser = res);
  }


  public resetSearch() {
    this.store.dispatch(new SearchDeactivate());
  }

  get guestUser(): boolean {
    return this.currentUser && this.currentUser?.role === 'guest';
  }
}
