import {Project} from '../../business-logic/model/projects/project';
import {User} from '../../business-logic/model/users/user';
import {Task} from '../../business-logic/model/tasks/task';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {SEARCH_ACTIONS} from './dashboard-search.consts';
import {Model} from '../../business-logic/model/models/model';
import {searchSetTerm} from './dashboard-search.actions';
import {ICommonSearchState} from '../common-search/common-search.reducer';

export interface ISearchState {
  projects: Project[];
  experiments: Task[];
  models: Model[];
  users: User[];
  resultsCounter: number;
  term: ICommonSearchState['searchQuery'];
  forceSearch: boolean;
  active: boolean;
}


export const searchInitialState: ISearchState = {
  term          : null,
  forceSearch: false,
  projects      : [],
  users         : [],
  experiments   : [],
  models        : [],
  resultsCounter: 0,
  active        : false
};

export function dashboardSearchReducer<ActionReducer>(state: ISearchState = searchInitialState, action) {
  switch (action.type) {
    case SEARCH_ACTIONS.ACTIVATE:
      return {...state, active: true};
    case SEARCH_ACTIONS.DEACTIVATE:
      return {...state, active: false, term: searchInitialState.term, forceSearch: false};
    case searchSetTerm.type: {
      const act = action as ReturnType<typeof searchSetTerm>;
      return {...state, term: act, forceSearch: act.force};
    }
    case SEARCH_ACTIONS.SET_PROJECTS:
      return {...state, projects: action.payload.projects, resultsCounter: state.resultsCounter + 1};
    case SEARCH_ACTIONS.SET_EXPERIMENTS:
      return {...state, experiments: action.payload.experiments, resultsCounter: state.resultsCounter + 1};
    case SEARCH_ACTIONS.SET_MODELS:
      return {...state, models: action.payload.models, resultsCounter: state.resultsCounter + 1};
    case SEARCH_ACTIONS.SEARCH_START:
      return {...state, resultsCounter: 0};
    case SEARCH_ACTIONS.SEARCH_CLEAR:
      return {
        ...state,
        ...searchInitialState
      };
    default: {
      return state;
    }
  }
}


export const selectSearch             = createFeatureSelector<ISearchState>('search');
export const selectProjectsResults    = createSelector(selectSearch, (state: ISearchState): Array<Project> => state.projects);
export const selectExperimentsResults = createSelector(selectSearch, (state: ISearchState): Array<Task> => state.experiments);
export const selectModelsResults      = createSelector(selectSearch, (state: ISearchState): Array<Model> => state.models);
export const selectActiveSearch       = createSelector(selectSearch, (state: ISearchState): boolean => state.term?.query?.length >= 3 || state.forceSearch);
export const selectSearchTerm         = createSelector(selectSearch, (state: ISearchState)  => state.term);
export const selectResultsCounter     = createSelector(selectSearch, (state: ISearchState): number => state.resultsCounter);
