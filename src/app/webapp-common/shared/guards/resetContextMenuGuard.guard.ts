import {CanDeactivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {headerActions} from '@common/core/actions/router.actions';
import {PROJECTS_FEATURES} from '~/features/projects/projects.consts';

export const resetContextMenuGuard: CanDeactivateFn<any> = (component,
                                                            currentRoute,
                                                            currentState,
                                                            nextState) => {
  const store = inject(Store);
  if (!(nextState.url.includes('projects') && (PROJECTS_FEATURES.some((ent)=> nextState.url.includes(ent))))){
    store.dispatch(headerActions.reset());
  }
  return true;
};
