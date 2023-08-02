import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {selectSelectedMetricVariantForCurrProject, selectSelectedProject} from '../../core/reducers/projects.reducer';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {setSelectedProjectId} from '@common/core/actions/projects.actions';

export const projectRedirectGuardGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectSelectedProject).pipe(
    tap(project => project === null && store.dispatch(setSelectedProjectId({projectId: route.params.projectId}))),
    filter(project => project?.id === route.params.projectId),
    withLatestFrom(store.select(selectSelectedMetricVariantForCurrProject)),
    map(([project, metVar]) => router.parseUrl(`projects/${project.id}/${(project.description || metVar) ? 'overview' : 'experiments'}`)));
};
