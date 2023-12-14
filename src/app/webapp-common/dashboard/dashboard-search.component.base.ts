import {initSearch, resetSearch} from '../common-search/common-search.actions';
import {filter, skip} from 'rxjs/operators';
import {Model} from '~/business-logic/model/models/model';
import {clearSearchResults, getCurrentPageResults, searchClear, searchDeactivate, searchStart} from '../dashboard-search/dashboard-search.actions';
import {IRecentTask} from './common-dashboard.reducer';
import {ITask} from '~/business-logic/model/al-task';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {SearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {Store} from '@ngrx/store';
import {
  selectActiveSearch,
  selectDatasetsResults,
  selectExperimentsResults,
  selectModelsResults,
  selectPipelinesResults,
  selectProjectsResults,
  selectReportsResults,
  selectResultsCount,
  selectSearchScrollIds,
  selectSearchTerm
} from '../dashboard-search/dashboard-search.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {setSelectedProjectId} from '../core/actions/projects.actions';
import {isExample} from '../shared/utils/shared-utils';
import {activeLinksList, ActiveSearchLink, activeSearchLink} from '~/features/dashboard-search/dashboard-search.consts';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { selectShowOnlyUserWork } from '@common/core/reducers/users-reducer';
import {IReport} from '@common/reports/reports.consts';

@Component({
  selector: 'sm-dashboard-search-base',
  template: `<sm-search-results-page
    *ngIf="activeSearch$ | async"
    (projectSelected)="projectCardClicked($event)"
    (experimentSelected)="taskSelected($event)"
    (modelSelected)="modelSelected($event)"
    (pipelineSelected)="pipelineSelected($event)"
    (activeLinkChanged)="activeLinkChanged($event)"
    (reportSelected)="reportSelected($event)"
    (openDatasetSelected)="openDatasetCardClicked($event)"
    (loadMoreClicked)="loadMore()"
    [projectsList]="projectsResults$ | async"
    [pipelinesList]="pipelinesResults$ | async"
    [datasetsList]="datasetsResults$ | async"
    [experimentsList]="experimentsResults$ | async"
    [modelsList]="modelsResults$ | async"
    [reportsList]="reportsResults$ | async"
    [activeLink]="activeLink"
    [resultsCount]="resultsCount$ | async">
  </sm-search-results-page>`,
})
export class DashboardSearchBaseComponent implements OnInit, OnDestroy{
  public activeLink = 'projects' as ActiveSearchLink;
  private searchSubs;
  private allResultsSubscription: Subscription;
  public searchQuery$: Observable<SearchState['searchQuery']>;
  public activeSearch$: Observable<boolean>;
  public modelsResults$: Observable<Array<Model>>;
  public projectsResults$: Observable<Array<Project>>;
  public experimentsResults$: Observable<any>;
  public searchTerm$: Observable<SearchState['searchQuery']>;
  public pipelinesResults$: Observable<Project[]>;
  public datasetsResults$: Observable<Project[]>;
  private scrollIds: Map<ActiveSearchLink, string>;
  public resultsCount$: Observable<Map<ActiveSearchLink, number>>;
  public reportsResults$: Observable<Array<IReport>>;

  constructor(public store: Store<any>, public router: Router){
    this.searchQuery$        = store.select(selectSearchQuery);
    this.activeSearch$       = store.select(selectActiveSearch);
    this.modelsResults$      = store.select(selectModelsResults);
    this.reportsResults$      = store.select(selectReportsResults);
    this.pipelinesResults$   = store.select(selectPipelinesResults);
    this.datasetsResults$   = store.select(selectDatasetsResults);
    this.projectsResults$    = store.select(selectProjectsResults);
    this.experimentsResults$ = store.select(selectExperimentsResults);
    this.searchTerm$         = store.select(selectSearchTerm);
    this.resultsCount$ = store.select(selectResultsCount);
    this.syncAppSearch();
  }

  public ngOnInit(): void {
    this.allResultsSubscription = this.resultsCount$.pipe(
      filter(resultsCount => !!resultsCount),
    ).subscribe((resultsCount) => this.setFirstActiveLink(resultsCount));
  }

  ngOnDestroy(): void {
    this.store.dispatch(searchClear());
    this.searchTermChanged('');
    this.stopSyncSearch();
    this.allResultsSubscription.unsubscribe();
  }

  stopSyncSearch() {
    this.store.dispatch(resetSearch());
    this.searchSubs.unsubscribe();
  }

  syncAppSearch() {
    this.store.dispatch(initSearch({payload: 'Search for all'}));

    this.searchSubs = combineLatest([
      this.searchQuery$,
      this.store.select(selectShowOnlyUserWork),
    ])
      .pipe(skip(1))
      .subscribe(([query]) => this.searchTermChanged(query?.query, query?.regExp));

    this.searchSubs.add(this.store.select(selectSearchScrollIds).subscribe(scrollIds => this.scrollIds = scrollIds));
  }

  public modelSelected(model: Model) {
    // TODO ADD task.id to route
    const projectId = model.project ? model.project : '*';
    this.router.navigateByUrl('projects/' + projectId + '/models/' + model.id);
  }

  public searchTermChanged(term: string, regExp?: boolean) {
    if (term && term.length > 0) {
      this.store.dispatch(searchStart({query:term, regExp, force: term.length < 3, activeLink: this.activeLink}));
    } else {
      this.activeLink = activeSearchLink.projects;
      this.store.dispatch(searchDeactivate());
    }
  }

  public projectCardClicked(project: Project) {
    this.router.navigateByUrl(`projects/${project.id}`);
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  pipelineSelected(project: Project) {
    this.router.navigateByUrl(`pipelines/${project.id}/experiments`);
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  reportSelected(report: IReport) {
    this.router.navigate(['reports',(report.project as any).id, report.id]);
  }

  public openDatasetCardClicked(project: Project) {
    this.router.navigateByUrl(`datasets/simple/${project.id}/experiments`);
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  public taskSelected(task: IRecentTask | ITask) {
    // TODO ADD task.id to route
    const projectId = task.project ? task.project.id : '*';
    return this.router.navigateByUrl('projects/' + projectId + '/experiments/' + task.id);
  }


  public activeLinkChanged(activeLink) {
    this.activeLink = activeLink;
    if (!this.scrollIds?.[activeLink]) {
      this.store.dispatch(getCurrentPageResults({activeLink}));
    }

  }

  setFirstActiveLink(resultsCount) {
    if (resultsCount[this.activeLink] > 0) {
      this.activeLinkChanged(this.activeLink);
    } else {
      const firstTabIndex = activeLinksList.findIndex(activeLink => resultsCount[activeLink.name] > 0);
      if (firstTabIndex > -1) {
        this.activeLinkChanged(activeLinksList[firstTabIndex].name);
      } else {
        this.store.dispatch(clearSearchResults());
      }
    }
  }

  loadMore() {
    this.store.dispatch(getCurrentPageResults({activeLink: this.activeLink}));
  }
}
