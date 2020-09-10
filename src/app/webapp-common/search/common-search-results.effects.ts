import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ActiveLoader, DeactiveLoader} from '../core/actions/layout.actions';
import {SearchActivate, SearchClear, SearchExperiments, SearchModels, SearchProjects, SearchSetTerm, SearchStart, SetExperimentsResults, SetModelsResults, SetProjectsResults} from './common-search-results.actions';
import {EXPERIMENT_SEARCH_ONLY_FIELDS, SEARCH_ACTIONS, SEARCH_PAGE_SIZE} from './common-search-results.consts';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {RequestFailed} from '../core/actions/http.actions';
import {Store} from '@ngrx/store';
import {selectActiveSearch} from './common-search-results.reducer';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {TaskTypeEnum} from '../../business-logic/model/tasks/taskTypeEnum';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {catchError, flatMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {escapeRegex} from '../shared/utils/shared-utils';

@Injectable()
export class CommonSearchResultsEffects {
  constructor(
    private actions: Actions,
    public projectsApi: ApiProjectsService,
    public modelsApi: ApiModelsService,
    public experimentsApi: ApiTasksService,
    private store: Store<any>
  ) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(SEARCH_ACTIONS.SEARCH_PROJECTS, SEARCH_ACTIONS.SEARCH_MODELS, SEARCH_ACTIONS.SEARCH_EXPERIMENTS),
    map(action => new ActiveLoader(action.type))
  );
  // add actions for each search
  @Effect()
  startSearch  = this.actions.pipe(
    ofType<SearchStart>(SEARCH_ACTIONS.SEARCH_START),
    withLatestFrom(this.store.select(selectActiveSearch)),
    flatMap(([action, active]) => {
      const actionsToFire = [];
      if (!active) {
        actionsToFire.push(new SearchClear());
        actionsToFire.push(new SearchActivate());
      }
      actionsToFire.push(new SearchSetTerm(action.payload, action.force));
      actionsToFire.push(new SearchProjects(action.payload));
      actionsToFire.push(new SearchExperiments(action.payload));
      actionsToFire.push(new SearchModels(action.payload));
      return actionsToFire;
    })
  );

  @Effect()
  searchProjects = this.actions.pipe(
    ofType<SearchProjects>(SEARCH_ACTIONS.SEARCH_PROJECTS),
    switchMap((action) => this.projectsApi.projectsGetAllEx({
      _any_          : {pattern: escapeRegex(action.payload), fields: ['name', 'id']},
      stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
      page           : 0,
      page_size      : SEARCH_PAGE_SIZE,
      include_stats  : true
    }).pipe(
      flatMap(res => [new SetProjectsResults(res.projects), new DeactiveLoader(action.type)]),
      catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error)])))
  );

  @Effect()
  searchModels = this.actions.pipe(
    ofType<SearchModels>(SEARCH_ACTIONS.SEARCH_MODELS),
    switchMap((action) => this.modelsApi.modelsGetAllEx({
      _any_      : {pattern: escapeRegex(action.payload), fields: ['name', 'id']},
      page       : 0,
      page_size  : SEARCH_PAGE_SIZE,
      system_tags: ['-archived'],
      only_fields: ['labels', 'ready', 'created', 'framework', 'user.name', 'name', 'parent.name', 'task.name', 'id', 'company']
    }).pipe(
      flatMap(res => [new SetModelsResults(res.models), new DeactiveLoader(action.type)]),
      catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error)])))
  );

  @Effect()
  searchExperiments = this.actions.pipe(
    ofType<SearchExperiments>(SEARCH_ACTIONS.SEARCH_EXPERIMENTS),
    switchMap((action) => this.experimentsApi.tasksGetAllEx({
      _any_      : {pattern: escapeRegex(action.payload), fields: ['name', 'id']},
      page       : 0,
      page_size  : SEARCH_PAGE_SIZE,
      only_fields: EXPERIMENT_SEARCH_ONLY_FIELDS,
      type       : ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
      system_tags: ['-archived']
    }).pipe(
      flatMap(res => [new SetExperimentsResults(res.tasks), new DeactiveLoader(action.type)]),
      catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error)])))
  );
}
