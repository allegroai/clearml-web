import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectActiveSearch} from '../../webapp-common/search/common-search-results.reducer';
import {ActivatedRoute, Router} from '@angular/router';
import {selectActiveWorkspace} from '../../webapp-common/core/reducers/users-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {addWorkspace} from '../../webapp-common/core/actions/users.actions';
import {distinctUntilKeyChanged, filter, skip} from 'rxjs/operators';
import {LoginService} from '../../webapp-common/shared/services/login.service';
import {ResetSelectedProject} from '../../webapp-common/core/actions/projects.actions';
import {GetRecentProjects, GetRecentTasks} from '../../webapp-common/dashboard/common-dashboard.actions';
import {InitSearch} from '../../webapp-common/common-search/common-search.actions';


@Component({
  selector: 'sm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public activeSearch$: Observable<boolean>;
  public workspace: GetCurrentUserResponseUserObjectCompany;
  private workspaceSub: Subscription;

  constructor(
    private store: Store<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService
  ) {
    const inviteId: string = this.activatedRoute.snapshot.queryParams['invite'];
    this.activeSearch$ = this.store.select(selectActiveSearch);
    this.workspaceSub = this.store.select(selectActiveWorkspace).pipe(
      filter(ws => !!ws),
      distinctUntilKeyChanged('id'),
      skip(1)
    ).subscribe(() => {
      this.store.dispatch(new ResetSelectedProject());
      this.store.dispatch(new InitSearch('Search for all'));
      this.store.dispatch(new GetRecentProjects());
      this.store.dispatch(new GetRecentTasks());
    });
    if (inviteId) {
      this.store.dispatch(addWorkspace({inviteId}));
      this.removeInviteFromURL();
    }
  }

  public redirectToWorkers() {
    this.router.navigateByUrl('/workers-and-queues');
  }

  public ngOnInit(): void {
  }

  private removeInviteFromURL() {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {invite: null},
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    this.loginService.clearLoginCache();
  }

  ngOnDestroy(): void {
    this.workspaceSub?.unsubscribe();
  }
}
