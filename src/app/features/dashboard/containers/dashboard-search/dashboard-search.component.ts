import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {combineLatest, Observable, ObservedValueOf, Subscription} from 'rxjs';
import {filter, skip} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {Project} from '../../../../business-logic/model/projects/project';
import {Model} from '../../../../business-logic/model/models/model';
import {DashboardSearchComponentBase} from '../../../../webapp-common/dashboard/dashboard-search.component.base';
import {SearchClear} from '../../../../webapp-common/dashboard-search/dashboard-search.actions';

@Component({
  selector   : '  sm-dashboard-search',
  templateUrl: './dashboard-search.component.html',
  styleUrls  : ['./dashboard-search.component.scss']
})
export class DashboardSearchComponent extends DashboardSearchComponentBase implements OnInit, OnDestroy {

  readonly tabsIndexes      = ['projects', 'experiments', 'models'];
  private allResultsJoin$: Observable<[ObservedValueOf<Observable<Array<Project>>>, ObservedValueOf<Observable<any>>, ObservedValueOf<Observable<Array<Model>>>, ObservedValueOf<Observable<number>>]>;
  private allResultsSubscription: Subscription;

  constructor(public store: Store<any>, public router: Router) {
    super(store);
    this.allResultsJoin$ = combineLatest([this.projectsResults$, this.experimentsResults$, this.modelsResults$, this.resultsCounter$]);
    this.syncAppSearch();
  }

  public ngOnInit(): void {
    this.allResultsSubscription = this.allResultsJoin$.pipe(
      skip(1),
      filter(allResults => allResults[this.tabsIndexes.length] === this.tabsIndexes.length)
    ).subscribe(allResults =>  this.setFirstActiveLink(allResults, this.tabsIndexes));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new SearchClear());
    this.searchTermChanged('');
    this.stopSyncSearch();
    this.allResultsSubscription.unsubscribe();
  }

}
