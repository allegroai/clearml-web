import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {selectIsArchivedMode} from '@common/core/reducers/projects.reducer';
import {selectContextMenu} from '@common/core/reducers/view.reducer';
import {setContextMenuActiveFeature} from '@common/core/actions/router.actions';
import {HeaderNavbarTabConfig} from '@common/layout/header-navbar-tabs/header-navbar-tabs-config.types';


@Component({
  selector: 'sm-header-navbar-tabs',
  templateUrl: './header-navbar-tabs.component.html',
  styleUrls: ['./header-navbar-tabs.component.scss']
})
export class HeaderNavbarTabsComponent {
  public routes: HeaderNavbarTabConfig[];

  public contextNavbar$: Observable<HeaderNavbarTabConfig[]>;
  public archivedMode$: Observable<boolean>;


  constructor(private store: Store) {
    this.contextNavbar$ = this.store.select(selectContextMenu);
    this.archivedMode$ = this.store.select(selectIsArchivedMode);
  }

  trackByFn(index, route: HeaderNavbarTabConfig) {
    return route.header;
  }

  setFeature(featureName: string) {
    this.store.dispatch(setContextMenuActiveFeature({activeFeature: featureName}))
  }
}
