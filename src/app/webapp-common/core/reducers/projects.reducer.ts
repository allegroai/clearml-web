import {createSelector} from '@ngrx/store';
import * as projectsActions from '../actions/projects.actions';
import {
  setCompanyTags,
  setGraphData,
  setMetricVariant,
  setTagColors,
  setTags,
  setTagsFilterByProject,
  TagColor
} from '../actions/projects.actions';
import {Project} from '../../../business-logic/model/projects/project';
import {getSystemTags} from '../../../features/experiments/shared/experiments.utils';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {MetricColumn} from '@common/shared/utils/tableParamEncode';

export const SYSTEM_TAGS_BLACK_LIST = ['archived'];

export interface ProjectStatsGraphData {
  id: string;
  x: number;
  y: number;
  name: string;
  type: string;
  status: string;
  user: string;
}

export interface RootProjects {
  projects: Project[];
  selectedProject: Project;
  archive: boolean;
  deep: boolean;
  projectTags: string[];
  companyTags: string[];
  systemTags: string[];
  tagsColors: { [tag: string]: TagColor };
  tagsFilterByProject: boolean;
  graphVariant: {[project: string]: MetricColumn};
  graphData: ProjectStatsGraphData[];
}

const initRootProjects: RootProjects = {
  projects: [],
  selectedProject: null,
  archive: false,
  deep:false,
  projectTags: [],
  companyTags: [],
  systemTags: [],
  tagsColors: {},
  tagsFilterByProject: true,
  graphVariant: {},
  graphData: null
};

export const projects = state => state.rootProjects as RootProjects;
export const selectRootProjects = createSelector(projects, (state): Project[] => state.projects);
export const selectSelectedProject = createSelector(projects, state => state.selectedProject);
export const selectSelectedProjectDescription = createSelector(projects, state => state.selectedProject?.description);
export const selectSelectedProjectId = createSelector(selectSelectedProject, (selectedProject): string => selectedProject ? selectedProject.id : '');
export const selectIsArchivedMode = createSelector(projects, state => state.archive);
export const selectIsDeepMode = createSelector(projects, state => state.deep);
export const selectTagsFilterByProject = createSelector(projects, state => state.tagsFilterByProject);
export const selectProjectTags = createSelector(projects, state => state.projectTags);
export const selectCompanyTags = createSelector(projects, state => state.companyTags);
export const selectProjectSystemTags = createSelector(projects, state => getSystemTags({system_tags: state.systemTags} as ITableExperiment));
export const selectTagsColors = createSelector(projects, state => state.tagsColors);
export const selectTagColors = createSelector(selectTagsColors,
  (tagsColors, props: { tag: string }) => tagsColors[props.tag]);
const selectSelectedProjectsMetricVariant = createSelector(projects, state => state.graphVariant);

export const selectSelectedMetricVariant = createSelector(selectSelectedProjectsMetricVariant,
  (projectsVariant, projectId: string) => projectsVariant[projectId]);

export const selectSelectedMetricVariantForCurrProject = createSelector(
  selectSelectedProjectsMetricVariant, selectSelectedProjectId,
  (projectsVariant, projectId) => projectsVariant[projectId]);

export const selectGraphData = createSelector(projects, state => state.graphData);


export const projectsReducer = (state: RootProjects = initRootProjects, action) => {
  switch (action.type) {
    case projectsActions.SET_PROJECTS:
      return {...state, projects: action.payload};
    case projectsActions.SET_SELECTED_PROJECT_ID: {
      const projectId = (action as projectsActions.SetSelectedProjectId).payload.projectId;
      return {
        ...state,
        ...(state.selectedProject?.id !== projectId && {archive: initRootProjects.archive}),
        graphData: initRootProjects.graphData,
      };
    }
    case projectsActions.setSelectedProject.type:
      return {...state, selectedProject: action.project};
    case projectsActions.RESET_SELECTED_PROJECT:
      return {...state, selectedProject: initRootProjects.selectedProject};
    case projectsActions.UPDATE_PROJECT: {
      return {...state, selectedProject: {...state.selectedProject, ...action.payload.changes}};
    }
    case projectsActions.setArchive.type:
      return {...state, archive: action.archive};
    case projectsActions.setDeep.type:
      return {...state, deep: action.deep};
    case setTags.type:
      return {...state, projectTags: action.tags};
    case setTagsFilterByProject.type:
      return {...state, tagsFilterByProject: action.tagsFilterByProject};
    case setCompanyTags.type:
      return {...state, companyTags: action.tags, systemTags: action.systemTags};
    case setTagColors.type:
      return {...state, tagsColors: {...state.tagsColors, [action.tag]: action.colors}};
    case setMetricVariant.type: {
      const payload = action as ReturnType<typeof setMetricVariant>;
      return {...state, graphVariant: {...state.graphVariant, [payload.projectId]: payload.col}};
    }
    case setGraphData.type:
      return {...state, graphData: (action as ReturnType<typeof setGraphData>).stats};
    default:
      return state;
  }
};
