import {initSearch, resetSearch} from '../common-search/common-search.actions';
import {distinctUntilChanged, distinctUntilKeyChanged, filter} from 'rxjs/operators';
import {Model} from '~/business-logic/model/models/model';
import {clearSearchResults, getCurrentPageResults, searchClear, searchDeactivate, searchSetTerm, searchStart} from '../dashboard-search/dashboard-search.actions';
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
import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { selectShowOnlyUserWork } from '@common/core/reducers/users-reducer';
import {IReport} from '@common/reports/reports.consts';
import {isEqual} from "lodash-es";

@Component({
  selector: 'sm-dashboard-search-base',
  template: `<sm-search-results-page
    *ngIf="activeSearch$ | async"
    (projectSelected)="projectCardClicked($event)"
    (experimentSelected)="taskSelected($event)"
    (modelSelected)="modelSelected($event)"
    (pipelineSelected)="pipelineSelected($event)"
    (activeLinkChanged)="changeActiveLink($event)"
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
  public store = inject(Store);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  private subs = new Subscription();
  private cdr: ChangeDetectorRef;
  constructor() {
    this.cdr = inject(ChangeDetectorRef);
    this.searchQuery$        = this.store.select(selectSearchQuery);
    this.activeSearch$       = this.store.select(selectActiveSearch);
    this.modelsResults$      = this.store.select(selectModelsResults);
    this.reportsResults$      = this.store.select(selectReportsResults);
    this.pipelinesResults$   = this.store.select(selectPipelinesResults);
    this.datasetsResults$   = this.store.select(selectDatasetsResults);
    this.projectsResults$    = this.store.select(selectProjectsResults);
    this.experimentsResults$ = this.store.select(selectExperimentsResults);
    this.searchTerm$         = this.store.select(selectSearchTerm);
    this.resultsCount$ = this.store.select(selectResultsCount);
    this.syncAppSearch();
  }

  public ngOnInit(): void {
    this.subs.add(this.resultsCount$.pipe(
      filter(resultsCount => !!resultsCount),
      distinctUntilChanged()
    ).subscribe((resultsCount) => this.setFirstActiveLink(resultsCount)));

    this.subs.add(this.route.queryParams.pipe(distinctUntilKeyChanged('tab'))
      .subscribe(params => {
      if (params.tab && activeLinksList.find( link => link.name === params.tab)) {
        this.activeLink = params.tab;
        this.activeLinkChanged(this.activeLink)
        this.cdr.markForCheck();
      }
    }));

    this.subs.add(this.searchQuery$.pipe(
      distinctUntilChanged((previous, current) => isEqual(previous, current)))
      .subscribe(query => {
      this.store.dispatch(searchSetTerm(query));
    }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(searchClear());
    this.searchTermChanged('');
    this.stopSyncSearch();
    this.subs.unsubscribe();
    this.searchSubs.unsubscribe();
  }

  stopSyncSearch() {
    this.store.dispatch(resetSearch());
    this.searchSubs.unsubscribe();
  }

  syncAppSearch() {
    this.store.dispatch(initSearch({payload: 'Search for all'}));

    this.searchSubs = combineLatest([
      this.searchTerm$,
      this.store.select(selectShowOnlyUserWork),
    ])
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
      this.store.dispatch(searchStart({query:term, regExp}));
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
    if (!this.scrollIds?.[activeLink]) {
      this.store.dispatch(getCurrentPageResults({activeLink}));
    }

  }

  setFirstActiveLink(resultsCount) {
    if (resultsCount[this.activeLink] > 0) {
      this.router.navigate([], {queryParams: {tab: this.activeLink}, queryParamsHandling: "merge", replaceUrl: true})
      this.store.dispatch(getCurrentPageResults({activeLink: this.activeLink}));
    } else {
      const firstTabIndex = activeLinksList.findIndex(activeLink => resultsCount[activeLink.name] > 0);
      if (firstTabIndex > -1) {
        this.router.navigate([], {queryParams: {tab: activeLinksList[firstTabIndex].name}, queryParamsHandling: "merge"})
        this.store.dispatch(getCurrentPageResults({activeLink: activeLinksList[firstTabIndex].name as ActiveSearchLink}));
      } else {
        this.store.dispatch(clearSearchResults());
      }
    }
  }

  loadMore() {
    this.store.dispatch(getCurrentPageResults({activeLink: this.activeLink}));
  }

  changeActiveLink(tab: string) {
    this.router.navigate([], {queryParams: {tab}, queryParamsHandling: "merge"})
  }
}
