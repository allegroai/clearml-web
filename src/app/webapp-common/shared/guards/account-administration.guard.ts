import {inject} from '@angular/core';
import {CanActivateFn} from '@angular/router';
import {combineLatest} from 'rxjs';
import {ConfigurationService} from '../services/configuration.service';
import {filter, map} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '../../core/reducers/users-reducer';

export const accountAdministrationGuard: CanActivateFn = () => {
  const configService = inject(ConfigurationService);
  const store = inject(Store);

  return combineLatest([
    configService.globalEnvironmentObservable,
    store.select(selectCurrentUser).pipe(filter(user => !!user))
  ]).pipe(
    map( ([env, currentUser]) => env.accountAdministration && currentUser.role === 'admin')
  );
};
