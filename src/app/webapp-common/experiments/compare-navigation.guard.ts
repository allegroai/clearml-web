import {CanActivateFn, createUrlTreeFromSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {map} from 'rxjs/operators';
import {selectTableCompareUrlParts} from '@common/experiments/reducers';

export const compareNavigationGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  return store.select(selectTableCompareUrlParts)
    .pipe(
      map(({view, selected, experiments, routeConfig}) => {
          return createUrlTreeFromSnapshot(route, [view, {ids: selected.length > 0 || routeConfig.includes('compare') ? selected : experiments}], route?.queryParams)
        }
      )
      );
};
