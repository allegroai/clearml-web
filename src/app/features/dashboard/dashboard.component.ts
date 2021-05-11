import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {selectActiveWorkspace, selectShowOnlyUserWork} from '../../webapp-common/core/reducers/users-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {addWorkspace} from '../../webapp-common/core/actions/users.actions';
import {distinctUntilKeyChanged, filter, skip, take} from 'rxjs/operators';
import {LoginService} from '../../webapp-common/shared/services/login.service';
import {ResetSelectedProject, setDeep} from '../../webapp-common/core/actions/projects.actions';
import {GetRecentProjects, GetRecentTasks} from '../../webapp-common/dashboard/common-dashboard.actions';
import {InitSearch} from '../../webapp-common/common-search/common-search.actions';
import {selectActiveSearch} from '../../webapp-common/common-search/common-search.reducer';
import {selectFirstLogin} from '../../webapp-common/core/reducers/view-reducer';
import {MatDialog} from '@angular/material/dialog';
import {WelcomeMessageComponent} from '../../webapp-common/dashboard/dumb/welcome-message/welcome-message.component';
import {firstLogin} from '../../webapp-common/core/actions/layout.actions';


@Component({
  selector: 'sm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public activeSearch$: Observable<boolean>;
  public workspace: GetCurrentUserResponseUserObjectCompany;
  private workspaceSub: Subscription;
  private welcomeSub: Subscription;
  showOnlyUserWorkSub: Subscription;

  constructor(
    private store: Store<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private loginService: LoginService
  ) {
    const inviteId: string = this.activatedRoute.snapshot.queryParams['invite'];
    this.activeSearch$ = this.store.select(selectActiveSearch);

    this.showOnlyUserWorkSub = this.store.select(selectShowOnlyUserWork).pipe(skip(1)).subscribe(() => {
      this.store.dispatch(new GetRecentProjects());
      this.store.dispatch(new GetRecentTasks());
    });

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
    } else {
      this.welcomeSub = this.store.select(selectFirstLogin)
        .pipe(
          filter(first => !!first),
          take(1)
        )
        .subscribe(() => {
          this.showWelcome();
        });
    }
  }

  public redirectToWorkers() {
    this.router.navigateByUrl('/workers-and-queues');
  }

  public ngOnInit(): void {
    this.store.dispatch(setDeep({deep: false}));
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
    this.welcomeSub?.unsubscribe();
  }

  private showWelcome() {
    this.dialog.open(WelcomeMessageComponent).afterClosed()
      .subscribe(() => this.store.dispatch(firstLogin({first: false})));
  }
}
