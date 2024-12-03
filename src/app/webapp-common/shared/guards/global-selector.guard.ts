import {inject} from '@angular/core';
import {CanActivateFn} from '@angular/router';
import {map} from 'rxjs/operators';
import {Store} from '@ngrx/store';

export const globalSelectorGuard: CanActivateFn = (route) => {
  const store = inject(Store);

  return store.select(route.data.selector).pipe(
    map( (isSelector) => isSelector)
  );
};
