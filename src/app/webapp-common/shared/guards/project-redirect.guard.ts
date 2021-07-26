import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectSelectedMetricVariantForCurrProject, selectSelectedProject} from '../../core/reducers/projects.reducer';
import {Project} from '../../../business-logic/model/projects/project';
import {filter, map, withLatestFrom} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectRedirectGuardGuard implements CanActivate {
  private selectedProject$: Observable<Project>;

  constructor(private store: Store, private router: Router) {
    this.selectedProject$ = this.store.select(selectSelectedProject);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.selectedProject$.pipe(
      filter(project => project?.id === route.params.projectId),
      withLatestFrom(this.store.select(selectSelectedMetricVariantForCurrProject)),
      map(([project, metVar]) => this.router.parseUrl(`projects/${project.id}/${(project.description || metVar) ? 'overview' : 'experiments'}`)));
  }

}
