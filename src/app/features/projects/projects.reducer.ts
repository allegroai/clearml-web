import {createFeatureSelector, createSelector} from '@ngrx/store';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../../webapp-common/shared/ui-components/data/table/table.consts';
import {
  CommonProjectReadyForDeletion,
  commonProjectsInitState,
  commonProjectsReducer,
  ICommonProjectsState
} from '../../webapp-common/projects/common-projects.reducer';
import {PROJECTS_ACTIONS} from '../../webapp-common/projects/common-projects.consts';
import {Project} from '../../business-logic/model/projects/project';

export interface IProjectReadyForDeletion extends CommonProjectReadyForDeletion{
}

export interface IProjectsState extends ICommonProjectsState {

  projectReadyForDeletion: IProjectReadyForDeletion;
}

const projectsInitState: IProjectsState = {
        ...commonProjectsInitState,
        projectReadyForDeletion: {
          project: null, experiments: null, models: null
        }
      };

// todo: where to put it?
const getCorrectSortingOrder = (currentSortOrder: TableSortOrderEnum, currentOrderField: string, nextOrderField: string) => {
  if (currentOrderField === nextOrderField) {
    return currentSortOrder === TABLE_SORT_ORDER.DESC ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC;
  } else {
    return TABLE_SORT_ORDER.ASC;
  }
};

export function projectsReducer<ActionReducer>(state: IProjectsState = projectsInitState, action): IProjectsState {

  switch (action.type) {
    case PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...projectsInitState.projectReadyForDeletion, project: action.payload.project}};
    case PROJECTS_ACTIONS.RESET_READY_TO_DELETE:
      return {...state, projectReadyForDeletion: projectsInitState.projectReadyForDeletion};
    case PROJECTS_ACTIONS.SET_PROJECT_READY_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...state.projectReadyForDeletion, ...action.payload.readyForDeletion}};
    default:
      return <IProjectsState>commonProjectsReducer(state, action);
  }
}

export const selectProjects               = createFeatureSelector<IProjectsState>('projects');
// TODO what to do?
export const selectPojectReadyForDeletion = createSelector(selectProjects, (state: IProjectsState): IProjectReadyForDeletion => state.projectReadyForDeletion);
