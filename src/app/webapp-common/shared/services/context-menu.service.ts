import {Injectable} from '@angular/core';

import {setContextMenu} from '@common/core/actions/router.actions';
import {Store} from '@ngrx/store';
import {PROJECT_ROUTES} from '~/features/projects/projects.consts';


@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {


  constructor(private readonly store: Store,
  ) {
  }

  setupProjectContextMenu(entitiesType, projectId) {
    const contextMenu = PROJECT_ROUTES.filter(route=> !(projectId==='*' && route.header==='overview'))
      .map(route => {
        return {
          ...route,
          link: route.header === entitiesType ? undefined : `projects/${projectId}/${route.header}`,
          isActive: route.header === entitiesType
        };
      });
    this.store.dispatch(setContextMenu({contextMenu}));
  }




  resetContextMenu(){
    this.store.dispatch(setContextMenu({contextMenu: null}))
  }
}
