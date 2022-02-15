import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {selectShowOnlyUserWork} from '../../webapp-common/core/reducers/users-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {filter, skip, take} from 'rxjs/operators';
import {setDeep} from '../../webapp-common/core/actions/projects.actions';
import {getRecentProjects, getRecentExperiments} from '../../webapp-common/dashboard/common-dashboard.actions';
import {selectActiveSearch} from '../../webapp-common/common-search/common-search.reducer';
import {selectFirstLogin} from '../../webapp-common/core/reducers/view.reducer';
import {MatDialog} from '@angular/material/dialog';
import {WelcomeMessageComponent} from '../../webapp-common/dashboard/dumb/welcome-message/welcome-message.component';
import {firstLogin} from '../../webapp-common/core/actions/layout.actions';
import {IRecentTask, selectRecentTasks} from '../../webapp-common/dashboard/common-dashboard.reducer';


@Component({
  selector: 'sm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public activeSearch$: Observable<boolean>;
  public recentTasks$: Observable<Array<IRecentTask>>;
  public workspace: GetCurrentUserResponseUserObjectCompany;
  public width: number;
  private welcomeSub: Subscription;
  private showOnlyUserWorkSub: Subscription;

  constructor(
    private store: Store<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.activeSearch$ = this.store.select(selectActiveSearch);
    this.recentTasks$ = this.store.select(selectRecentTasks);

    this.showOnlyUserWorkSub = this.store.select(selectShowOnlyUserWork).pipe(skip(1)).subscribe(() => {
      this.store.dispatch(getRecentProjects());
      this.store.dispatch(getRecentExperiments());
    });

    this.welcomeSub = this.store.select(selectFirstLogin)
      .pipe(
        filter(first => !!first),
        take(1)
      )
      .subscribe(() => {
        this.showWelcome();
      });
  }

  public redirectToWorkers() {
    this.router.navigateByUrl('/workers-and-queues');
  }

  public ngOnInit(): void {
    this.store.dispatch(setDeep({deep: false}));
  }

  ngOnDestroy(): void {
    this.welcomeSub?.unsubscribe();
  }

  private showWelcome() {
    this.dialog.open(WelcomeMessageComponent).afterClosed()
      .subscribe(() => this.store.dispatch(firstLogin({first: false})));
  }

  setWidth(width: number) {
    this.width = width;
  }
}
