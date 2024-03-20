import {CanActivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {setCompareView} from '@common/experiments/actions/common-experiments-view.actions';

export const compareViewStateGuard: CanActivateFn = route => {
  const store = inject(Store);
  store.dispatch(setCompareView({mode: route.url[1]?.path.endsWith('scalars') ? 'scalars' : 'plots'}))
  return true;
};
