import {CanActivateFn, createUrlTreeFromSnapshot} from '@angular/router';
import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectViewMode} from '@common/experiments-compare/reducers';
import {map} from 'rxjs/operators';

export const compareNavigationGuard: CanActivateFn = route => {
  const store = inject(Store);
  const currentPage = route?.url?.[0]?.path;

  return store.select(selectViewMode(currentPage))
      .pipe(
          map(mode => createUrlTreeFromSnapshot(route, [mode]))
      );
};
