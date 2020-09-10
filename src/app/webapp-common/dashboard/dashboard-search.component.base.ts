import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {skip} from 'rxjs/operators';
import {Model} from '../../business-logic/model/models/model';
import {SearchDeactivate, SearchStart} from '../search/common-search-results.actions';
import {IRecentTask} from './common-dashboard.reducer';
import {ITask} from '../../business-logic/model/al-task';
import {Observable} from 'rxjs';
import {selectSearchQuery} from '../common-search/common-search.reducer';
import {Store} from '@ngrx/store';
import {
  selectActiveSearch, selectExperimentsResults, selectModelsResults, selectProjectsResults,
  selectResultsCounter,
  selectSearchTerm
} from '../search/common-search-results.reducer';
import {Project} from '../../business-logic/model/projects/project';

export abstract class DashboardSearchComponentBase {

  abstract store;
  abstract router;
  public activeLink: string = 'projects';
  private searchSubs;
  public searchQuery$: Observable<string>;
  public activeSearch$: Observable<boolean>;
  protected readonly resultsCounter$: Observable<number>;
  public modelsResults$: Observable<Array<Model>>;
  public projectsResults$: Observable<Array<Project>>;
  public experimentsResults$: Observable<any>;
  public searchTerm$: Observable<string>;

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

    this.searchSubs = this.searchQuery$.pipe(skip(1)).subscribe(query => {
      this.searchTermChanged(query);
    });
  }

  public modelSelected(model: Model) {
    // TODO ADD task.id to route
    const projectId = model.project ? model.project : '*';
    this.router.navigateByUrl('projects/' + projectId + '/models/' + model.id);
  }

  public searchTermChanged(term: string) {
    if (term && term.length > 0) {
      this.store.dispatch(new SearchStart(term, term.length < 3));
    } else {
      this.activeLink = 'projects';
      this.store.dispatch(new SearchDeactivate());
    }
  }

  public projectCardClicked(projectId) {
    return this.router.navigateByUrl('projects/' + projectId + '/experiments');
  }

  public taskSelected(task: IRecentTask | ITask) {
    // TODO ADD task.id to route
    const projectId = task.project ? task.project.id : '*';
    return this.router.navigateByUrl('projects/' + projectId + '/experiments/' + task.id);
  }


  public activeLinkChanged(activeLink) {
    this.activeLink = activeLink;
  }

  setFirstActiveLink(allResults, tabsIndexes) {
    if (!(allResults[tabsIndexes.indexOf(this.activeLink)].length > 0)) {
      const firstTabIndex = allResults.findIndex(list => list.length > 0);
      if (firstTabIndex > -1) {
        this.activeLink = tabsIndexes[firstTabIndex];
      }
    }
  }
}
