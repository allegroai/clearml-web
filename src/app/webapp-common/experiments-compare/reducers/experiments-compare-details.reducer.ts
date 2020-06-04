import * as actions from '../actions/experiments-compare-details.actions';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';

export interface IExperimentCompareDetailsState {
  experiments: Array<IExperimentDetail>;
  expandedPaths: Array<string>;
}

export const initialState: IExperimentCompareDetailsState = {
  expandedPaths: [],
  experiments  : []
};


export function experimentsCompareDetailsReducer(state: IExperimentCompareDetailsState = initialState, action): IExperimentCompareDetailsState {
  switch (action.type) {
    case actions.SET_EXPERIMENTS:
      return {...state, experiments: action.payload};
    case actions.EXPAND_NODE:
      return {...state, expandedPaths: state.expandedPaths.concat(action.payload)};
    case actions.COLLAPSE_NODE:
      return {...state, expandedPaths: state.expandedPaths.filter(path => path !== action.payload)};
    case actions.RESET_STATE:
      return {...initialState};
    default:
      return state;
  }
}
