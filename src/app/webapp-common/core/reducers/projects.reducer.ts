import {createReducer, createSelector, on} from '@ngrx/store';
import * as projectsActions from '../actions/projects.actions';
import {TagColor} from '../actions/projects.actions';
import {Project} from '~/business-logic/model/projects/project';
import {getSystemTags} from '~/features/experiments/shared/experiments.utils';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {MetricColumn} from '@common/shared/utils/tableParamEncode';
import {User} from '~/business-logic/model/users/user';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {selectRouterConfig} from "@common/core/reducers/router-reducer";


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
  projectAncestors: Project[];
  archive: boolean;
  deep: boolean;
  projectTags: string[];
  companyTags: string[];
  systemTags: string[];
  tagsColors: { [tag: string]: TagColor };
  tagsFilterByProject: boolean;
  graphVariant: { [project: string]: MetricColumn };
  graphData: ProjectStatsGraphData[];
  hiddenStates: { [state: string]: boolean };
  lastUpdate: string;
  users: User[];
  allUsers: User[];
  extraUsers: User[];
  showHidden: boolean;
  hideExamples: boolean;
  mainPageTagsFilter: { [Feature: string]: string[] };
  mainPageTagsFilterMatchMode: string;
  defaultNestedModeForFeature: { [feature: string]: boolean };
  tablesFilterProjectsOptions: Partial<ProjectsGetAllResponseSingle>[];
  projectsOptionsScrollId: string;
}

const initRootProjects: RootProjects = {
  mainPageTagsFilter: {},
  mainPageTagsFilterMatchMode: 'AND',
  projects: null,
  selectedProject: null,
  projectAncestors: null,
  archive: false,
  deep: false,
  projectTags: [],
  companyTags: [],
  systemTags: [],
  tagsColors: {},
  tagsFilterByProject: true,
  graphVariant: {},
  graphData: null,
  hiddenStates: {},
  lastUpdate: null,
  users: [],
  allUsers: [],
  extraUsers: [],
  showHidden: false,
  hideExamples: false,
  defaultNestedModeForFeature: {},
  tablesFilterProjectsOptions: null,
  projectsOptionsScrollId: null
};

export const projects = state => state.rootProjects as RootProjects;
export const selectRootProjects = createSelector(projects, (state): Project[] => state.projects);
export const selectSelectedProject = createSelector(projects, state => state.selectedProject);
export const selectProjectAncestors = createSelector(projects, state => state.projectAncestors);
export const selectSelectedProjectDescription = createSelector(projects, state => state.selectedProject?.description);
export const selectSelectedProjectId = createSelector(selectSelectedProject, (selectedProject): string => selectedProject ? selectedProject.id : '');
export const selectIsArchivedMode = createSelector(projects, state => state.archive);
export const selectIsDeepMode = createSelector(projects, state => state.deep);
export const selectTagsFilterByProject = createSelector(projects, selectSelectedProjectId,
  (state, projectId) => projectId !== '*' && state.tagsFilterByProject);
export const selectProjectTags = createSelector(projects, state => state.projectTags);
export const selectMainPageTagsFilter = createSelector(projects, selectRouterConfig, (state, config) => config?.[0] ? state.mainPageTagsFilter[config?.[0]] : []);
export const selectMainPageTagsFilterMatchMode = createSelector(projects, state => state.mainPageTagsFilterMatchMode);
export const selectCompanyTags = createSelector(projects, state => state.companyTags);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const selectProjectSystemTags = createSelector(projects, state => getSystemTags({system_tags: state.systemTags} as ITableExperiment));
export const selectTagsColors = createSelector(projects, state => state.tagsColors);
export const selectLastUpdate = createSelector(projects, state => state.lastUpdate);
export const selectTagColors = createSelector(selectTagsColors,
  (tagsColors, props: { tag: string }) => tagsColors[props.tag]);
const selectSelectedProjectsMetricVariant = createSelector(projects, state => state.graphVariant);
export const selectSelectedMetricVariant = createSelector(selectSelectedProjectsMetricVariant,
  (projectsVariant, projectId: string) => projectsVariant[projectId]);
export const selectSelectedMetricVariantForCurrProject = createSelector(
  selectSelectedProjectsMetricVariant, selectSelectedProjectId,
  (projectsVariant, projectId) => projectsVariant[projectId]);
export const selectGraphData = createSelector(projects, state => state.graphData);
export const selectGraphHiddenStates = createSelector(projects, state => state.hiddenStates);
export const selectProjectUsers = createSelector(projects, state => state.extraUsers.length ?
  Array.from(new Set([...state.users, ...state.extraUsers])) :
  state.users
);
export const selectAllProjectsUsers = createSelector(projects, state => state.allUsers);
export const selectTablesFilterProjectsOptions = createSelector(projects, state => state.tablesFilterProjectsOptions);

export const projectsReducer = createReducer(
  initRootProjects,
  on(projectsActions.resetProjects, state => ({...state, projects: [], lastUpdate: null})),
  on(projectsActions.setSelectedProjectId, (state, action) => {
    const projectId = action.projectId;
    return {
      ...state,
      ...(state.selectedProject?.id !== projectId && {archive: initRootProjects.archive}),
      graphData: initRootProjects.graphData,
    };
  }),
  on(projectsActions.setSelectedProject, (state, action) => ({
    ...state,
    selectedProject: action.project,
    extraUsers: []
  })),
  on(projectsActions.setProjectAncestors, (state, action) => ({...state, projectAncestors: action.projects})),
  on(projectsActions.setSelectedProjectStats, (state, action) => ({
    ...state,
    selectedProject: {
      ...state.selectedProject,
      stats: action.project?.stats
    }
  })),
  on(projectsActions.resetSelectedProject, state => ({
    ...state,
    selectedProject: initRootProjects.selectedProject,
    users: [],
    extraUsers: []
  })),
  on(projectsActions.updateProjectCompleted, (state, action) => ({
    ...state,
    selectedProject: {...state.selectedProject, ...action.changes},
    projects: state.projects.map(project => project.id === action.id ? project : {...project, ...action.changes})
  })),
  on(projectsActions.setArchive, (state, action) => ({...state, archive: action.archive})),
  on(projectsActions.setDeep, (state, action) => ({...state, deep: action.deep})),
  on(projectsActions.setTags, (state, action) => ({...state, projectTags: action.tags})),
  on(projectsActions.setTagsFilterByProject, (state, action) => ({
    ...state,
    tagsFilterByProject: action.tagsFilterByProject
  })),
  on(projectsActions.setCompanyTags, (state, action) => ({
    ...state,
    companyTags: action.tags,
    systemTags: action.systemTags
  })),
  on(projectsActions.addProjectTags, (state, action) => ({
    ...state,
    projectTags: Array.from(new Set(state.projectTags.concat(action.tags))).sort()
  })),
  on(projectsActions.setMainPageTagsFilter, (state, action) => ({
    ...state,
    mainPageTagsFilter: {...state.mainPageTagsFilter, [action.feature] : action.tags }})),
  on(projectsActions.setMainPageTagsFilterMatchMode, (state, action) => ({
    ...state,
    mainPageTagsFilterMatchMode: action.matchMode
  })),
  on(projectsActions.setTagColors, (state, action) => ({
    ...state,
    tagsColors: {...state.tagsColors, [action.tag]: action.colors}
  })),
  on(projectsActions.setMetricVariant, (state, action) => ({
    ...state, graphVariant: {...state.graphVariant, [action.projectId]: action.col}
  })),
  on(projectsActions.setGraphData, (state, action) => ({...state, graphData: action.stats})),
  on(projectsActions.toggleState, (state, action) => ({
    ...state,
    hiddenStates: {...state.hiddenStates, [action.state]: !state.hiddenStates?.[action.state]}
  })),
  on(projectsActions.setLastUpdate, (state, action) => ({...state, lastUpdate: action.lastUpdate})),
  on(projectsActions.setProjectUsers, (state, action) => ({...state, users: action.users, extraUsers: []})),
  on(projectsActions.setAllProjectUsers, (state, action) => ({...state, allUsers: action.users})),
  on(projectsActions.setProjectExtraUsers, (state, action) => ({...state, extraUsers: action.users})),
  on(projectsActions.setShowHidden, (state, action) => ({...state, showHidden: action.show})),
  on(projectsActions.setHideExamples, (state, action) => ({...state, hideExamples: action.hide})),
  on(projectsActions.setDefaultNestedModeForFeature, (state, action) => ({
    ...state,
    defaultNestedModeForFeature: {...state.defaultNestedModeForFeature, [action.feature]: action.isNested}
  })),
  on(projectsActions.resetTablesFilterProjectsOptions, (state) => ({...state, tablesFilterProjectsOptions: null})),
  on(projectsActions.setTablesFilterProjectsOptions, (state, action) => ({
    ...state,
    tablesFilterProjectsOptions: action.loadMore ? (state.tablesFilterProjectsOptions || []).concat(action.projects) : action.projects,
    projectsOptionsScrollId: action.scrollId
  }))
);
export const selectShowHiddenUserSelection = createSelector(projects, state => state.showHidden);
export const selectShowHidden = createSelector(projects, selectSelectedProject,
  (state, selectedProject) => (state?.showHidden || selectedProject?.system_tags?.includes('hidden')));

export const selectHideExamples = createSelector(projects, state => state?.hideExamples);
export const selectDefaultNestedModeForFeature = createSelector(projects, state => state?.defaultNestedModeForFeature);
export const selectProjectsOptionsScrollId = createSelector(projects, state => state?.projectsOptionsScrollId);
