import {Project} from '../../business-logic/model/projects/project';
import {User} from '../../business-logic/model/users/user';
import {Task} from 'app/business-logic/model/tasks/task';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {SEARCH_ACTIONS} from './common-search-results.consts';
import {Model} from '../../business-logic/model/models/model';

export interface ISearchState {
  projects: Project[];
  experiments: Task[];
  models: Model[];
  users: User[];
  resultsCounter: number;
  term: string;
  forceSearch: boolean;
  active: boolean;
}


const searchInitialState: ISearchState = {
  term          : '',
  forceSearch: false,
  projects      : [],
  users         : [],
  experiments   : [],
  models        : [],
  resultsCounter: 0,
  active        : false
};

export function commonSearchResultsReducer<ActionReducer>(state: ISearchState = searchInitialState, action) {
  switch (action.type) {
    case SEARCH_ACTIONS.ACTIVATE:
      return {...state, active: true};
    case SEARCH_ACTIONS.DEACTIVATE:
      return {...state, active: false, term: '', forceSearch: false};
    case SEARCH_ACTIONS.SET_TERM:
      return {...state, term: action.payload, forceSearch: action.force};
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
        term       : '',
        projects   : [],
        users      : [],
        experiments: [],
        models     : [],
        active     : false
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
export const selectActiveSearch       = createSelector(selectSearch, (state: ISearchState): boolean => state.term.length >= 3 || state.forceSearch);
export const selectSearchTerm         = createSelector(selectSearch, (state: ISearchState): string => state.term);
export const selectResultsCounter     = createSelector(selectSearch, (state: ISearchState): number => state.resultsCounter);
