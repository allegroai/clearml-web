import {inject, Injectable} from '@angular/core';

import {headerActions} from '@common/core/actions/router.actions';
import {Store} from '@ngrx/store';
import {PROJECT_ROUTES} from '~/features/projects/projects.consts';


@Injectable({
  providedIn: 'root'
})
export class HeaderMenuService {
  private readonly store = inject(Store);

  setupProjectContextMenu(entitiesType, projectId) {
    const contextMenu = PROJECT_ROUTES
      .filter(route=> !(projectId==='*' && route.header==='overview'))
      .map(route => {
        return {
          ...route,
          featureName: route.header,
          link: `projects/${projectId}/${route.header}`,
        };
      });
    this.store.dispatch(headerActions.setTabs({contextMenu, active: entitiesType}));
  }

  resetContextMenu(){
    this.store.dispatch(headerActions.reset())
  }
}
