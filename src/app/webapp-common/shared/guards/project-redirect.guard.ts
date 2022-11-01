import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectSelectedMetricVariantForCurrProject, selectSelectedProject} from '../../core/reducers/projects.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {setSelectedProjectId} from '@common/core/actions/projects.actions';

@Injectable({
  providedIn: 'root'
})
export class ProjectRedirectGuardGuard implements CanActivate {
  private selectedProject$: Observable<Project>;

  constructor(private store: Store, private router: Router) {
    this.selectedProject$ = this.store.select(selectSelectedProject);
  }

  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.selectedProject$.pipe(
      tap(project =>
        project === null && this.store.dispatch(setSelectedProjectId({projectId: route.params.projectId}))
      ),
      filter(project => project?.id === route.params.projectId),

      withLatestFrom(this.store.select(selectSelectedMetricVariantForCurrProject)),
      map(([project, metVar]) => this.router.parseUrl(`projects/${project.id}/${(project.description || metVar) ? 'overview' : 'experiments'}`)));
  }

}
