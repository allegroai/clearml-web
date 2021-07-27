import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {filter, skip} from 'rxjs/operators';
import {Model} from '../../business-logic/model/models/model';
import {SearchDeactivate, searchStart} from '../dashboard-search/dashboard-search.actions';
import {IRecentTask} from './common-dashboard.reducer';
import {ITask} from '../../business-logic/model/al-task';
import {Observable} from 'rxjs';
import {ICommonSearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {Store} from '@ngrx/store';
import {
  selectActiveSearch, selectExperimentsResults, selectModelsResults, selectProjectsResults,
  selectResultsCounter,
  selectSearchTerm
} from '../dashboard-search/dashboard-search.reducer';
import {Project} from '../../business-logic/model/projects/project';
import {SetSelectedProjectId} from '../core/actions/projects.actions';
import {isExample} from '../shared/utils/shared-utils';

export abstract class DashboardSearchComponentBase {

  abstract store;
  abstract router;
  public activeLink: string = 'projects';
  private searchSubs;
  public searchQuery$: Observable<ICommonSearchState['searchQuery']>;
  public activeSearch$: Observable<boolean>;
  protected readonly resultsCounter$: Observable<number>;
  public modelsResults$: Observable<Array<Model>>;
  public projectsResults$: Observable<Array<Project>>;
  public experimentsResults$: Observable<any>;
  public searchTerm$: Observable<ICommonSearchState['searchQuery']>;

  constructor(store: Store<any>){
    this.searchQuery$        = store.select(selectSearchQuery);
    this.activeSearch$       = store.select(selectActiveSearch);
    this.resultsCounter$     = store.select(selectResultsCounter);
    this.modelsResults$      = store.select(selectModelsResults);
    this.projectsResults$    = store.select(selectProjectsResults);
    this.experimentsResults$ = store.select(selectExperimentsResults);
    this.searchTerm$         = store.select(selectSearchTerm);

  }

  stopSyncSearch() {
    this.store.dispatch(new ResetSearch());
    this.searchSubs.unsubscribe();
  }

  syncAppSearch() {
    this.store.dispatch(new InitSearch('Search for all'));

    this.searchSubs = this.searchQuery$
      .pipe(skip(1))
      .subscribe(query => {
        this.searchTermChanged(query.query, query.regExp);
      });
  }

  public modelSelected(model: Model) {
    // TODO ADD task.id to route
    const projectId = model.project ? model.project : '*';
    this.router.navigateByUrl('projects/' + projectId + '/models/' + model.id);
  }

  public searchTermChanged(term: string, regExp?: boolean) {
    if (term && term.length > 0) {
      this.store.dispatch(searchStart({query:term, regExp, force: term.length < 3}));
    } else {
      this.activeLink = 'projects';
      this.store.dispatch(new SearchDeactivate());
    }
  }

  public projectCardClicked(project: Project) {
    this.router.navigateByUrl(`projects/${project.id}`);
    this.store.dispatch(new SetSelectedProjectId(project.id, isExample(project)));
  }

  public taskSelected(task: IRecentTask | ITask) {
    // TODO ADD task.id to route
    const projectId = task.project ? task.project.id : '*';
    return this.router.navigateByUrl('projects/' + projectId + '/experiments/' + task.id);
  }


  public activeLinkChanged(activeLink) {
    this.activeLink = activeLink;
  }

  setFirstActiveLink(allResults, tabsIndexes: string[]) {
    if (!(allResults[tabsIndexes.indexOf(this.activeLink)].length > 0)) {
      const firstTabIndex = allResults.findIndex(list => list.length > 0);
      if (firstTabIndex > -1) {
        this.activeLink = tabsIndexes[firstTabIndex];
      }
    }
  }
}
