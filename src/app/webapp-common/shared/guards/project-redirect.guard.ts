import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectSelectedProject} from '../../core/reducers/projects.reducer';
import {Project} from '../../../business-logic/model/projects/project';
import {filter, map} from 'rxjs/operators';

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
      map(project => this.router.parseUrl(`projects/${project.id}/${project.description ? 'overview' : 'experiments'}`)));
  }

}
