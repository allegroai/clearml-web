import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectIsArchivedMode} from '@common/core/reducers/projects.reducer';
import {selectContextMenu} from '@common/core/reducers/view.reducer';
import {headerActions} from '@common/core/actions/router.actions';
import {HeaderNavbarTabConfig} from '@common/layout/header-navbar-tabs/header-navbar-tabs-config.types';


@Component({
  selector: 'sm-header-navbar-tabs',
  templateUrl: './header-navbar-tabs.component.html',
  styleUrls: ['./header-navbar-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderNavbarTabsComponent {
  private store = inject(Store);
  public routes: HeaderNavbarTabConfig[];

  protected contextNavbar = this.store.selectSignal(selectContextMenu);
  protected archivedMode = this.store.selectSignal(selectIsArchivedMode);

  setFeature(featureName: string) {
    this.store.dispatch(headerActions.setActiveTab({activeFeature: featureName}))
  }
}
