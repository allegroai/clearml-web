import {createReducer, createSelector, on} from '@ngrx/store';
import * as projectsActions from '../actions/projects.actions';
import {TagColor} from '../actions/projects.actions';
import {Project} from '~/business-logic/model/projects/project';
import {getSystemTags} from '~/features/experiments/shared/experiments.utils';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {MetricColumn} from '@common/shared/utils/tableParamEncode';
import {sortByField} from '@common/tasks/tasks.utils';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {User} from '~/business-logic/model/users/user';


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
  graphVariant: { [project: string]: MetricColumn };
  graphData: ProjectStatsGraphData[];
  lastUpdate: string;
  users: User[];
  allUsers: User[];
  extraUsers: User[];
  showHidden: boolean;
  hideExamples: boolean;
  mainPageTagsFilter: string[];
  mainPageTagsFilterMatchMode: string;
}

const initRootProjects: RootProjects = {
  mainPageTagsFilter: [],
  mainPageTagsFilterMatchMode: 'AND',
  projects: null,
  selectedProject: null,
  archive: false,
  deep: false,
  projectTags: [],
  companyTags: [],
  systemTags: [],
  tagsColors: {},
  tagsFilterByProject: true,
  graphVariant: {},
  graphData: null,
  lastUpdate: null,
  users: [],
  allUsers: [],
  extraUsers: [],
  showHidden: false,
  hideExamples: false
};

export const projects = state => state.rootProjects as RootProjects;
export const selectRootProjects = createSelector(projects, (state): Project[] => state.projects);
export const selectSelectedProject = createSelector(projects, (state): ProjectsGetAllResponseSingle => state.selectedProject);
export const selectSelectedProjectDescription = createSelector(projects, state => state.selectedProject?.description);
export const selectSelectedProjectId = createSelector(selectSelectedProject, (selectedProject): string => selectedProject ? selectedProject.id : '');
export const selectIsArchivedMode = createSelector(projects, state => state.archive);
export const selectIsDeepMode = createSelector(projects, state => state.deep);
export const selectTagsFilterByProject = createSelector(projects, state => state.tagsFilterByProject);
export const selectProjectTags = createSelector(projects, state => state.projectTags);
export const selectMainPageTagsFilter = createSelector(projects, state => state.mainPageTagsFilter);
export const selectMainPageTagsFilterMatchMode = createSelector(projects, state => state.mainPageTagsFilterMatchMode);
export const selectCompanyTags = createSelector(projects, state => state.companyTags);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const selectProjectSystemTags = createSelector(projects, state => getSystemTags({system_tags: state.systemTags} as ITableExperiment));
export const selectTagsColors = createSelector(projects, state => state.tagsColors);
export const selectLastUpdate = createSelector(projects, (state): string => state.lastUpdate);
export const selectTagColors = createSelector(selectTagsColors,
  (tagsColors, props: { tag: string }) => tagsColors[props.tag]);
const selectSelectedProjectsMetricVariant = createSelector(projects, state => state.graphVariant);
export const selectSelectedMetricVariant = createSelector(selectSelectedProjectsMetricVariant,
  (projectsVariant, projectId: string) => projectsVariant[projectId]);
export const selectSelectedMetricVariantForCurrProject = createSelector(
  selectSelectedProjectsMetricVariant, selectSelectedProjectId,
  (projectsVariant, projectId) => projectsVariant[projectId]);
export const selectGraphData = createSelector(projects, state => state.graphData);
export const selectProjectUsers = createSelector(projects, state => state.extraUsers.length ?
  Array.from(new Set([...state.users, ...state.extraUsers])) :
  state.users
);
export const selectAllProjectsUsers = createSelector(projects, state => state.allUsers);

export const projectsReducer = createReducer(
  initRootProjects,
  on(projectsActions.resetProjects, state => ({...state, projects: [], lastUpdate: null})),
  on(projectsActions.setAllProjects, (state, action) => {
    let newProjects = state.projects;
    if (action.updating) {
      action.projects.forEach(proj => {
        const index = state.projects.findIndex(stateProject => stateProject.id === proj.id);
        if (index > -1) {
          newProjects = [...newProjects.slice(0, index), proj, ...newProjects.slice(index + 1)];
        } else {
          newProjects = [...newProjects, proj];
        }
      });
    } else {
      newProjects = [...(newProjects || []), ...action.projects];
    }
    return {...state, projects: sortByField(newProjects, 'name')};

  }),
  on(projectsActions.setSelectedProjectId, (state, action) => {
    const projectId = action.projectId;
    return {
      ...state,
      ...(state.selectedProject?.id !== projectId && {archive: initRootProjects.archive}),
      graphData: initRootProjects.graphData,
    };
  }),
  on(projectsActions.setSelectedProject, (state, action) => ({...state, selectedProject: action.project, extraUsers: []})),
  on(projectsActions.setSelectedProjectStats, (state, action) => ({
    ...state,
    selectedProject: {
      ...state.selectedProject,
      stats: action.project?.stats
    }})),
  on(projectsActions.deletedProjectFromRoot, (state, action) => {
    const projectIdsToDelete = [action.project.id].concat(action.project.sub_projects.map(project => project.id));
    return {...state, projects: state.projects.filter(project => !projectIdsToDelete.includes(project.id))};
  }),
  on(projectsActions.resetSelectedProject, state => ({...state, selectedProject: initRootProjects.selectedProject, users: [], extraUsers: []})),
  on(projectsActions.updateProjectCompleted, (state, action) => ({
    ...state,
    selectedProject: {...state.selectedProject, ...action.changes},
    projects: state.projects.map(project => project.id === action.id ? project : {...project, ...action.changes})
  })),
  on(projectsActions.setArchive, (state, action) => ({...state, archive: action.archive})),
  on(projectsActions.setDeep, (state, action) => ({...state, deep: action.deep})),
  on(projectsActions.setTags, (state, action) => ({...state, projectTags: action.tags})),
  on(projectsActions.setTagsFilterByProject, (state, action) => ({...state, tagsFilterByProject: action.tagsFilterByProject})),
  on(projectsActions.setCompanyTags, (state, action) => ({...state, companyTags: action.tags, systemTags: action.systemTags})),
  on(projectsActions.addProjectTags, (state, action) => ({...state, projectTags: Array.from(new Set(state.projectTags.concat(action.tags))).sort()})),
  on(projectsActions.setMainPageTagsFilter, (state, action) => ({...state, mainPageTagsFilter: action.tags})),
  on(projectsActions.setMainPageTagsFilterMatchMode, (state, action) => ({...state, mainPageTagsFilterMatchMode: action.matchMode})),
  on(projectsActions.setTagColors, (state, action) => ({...state, tagsColors: {...state.tagsColors, [action.tag]: action.colors}})),
  on(projectsActions.setMetricVariant, (state, action) => ({
    ...state, graphVariant: {...state.graphVariant, [action.projectId]: action.col}
  })),
  on(projectsActions.setGraphData, (state, action) => ({...state, graphData: action.stats})),
  on(projectsActions.setLastUpdate, (state, action) => ({...state, lastUpdate: action.lastUpdate})),
  on(projectsActions.setProjectUsers, (state, action) => ({...state, users: action.users, extraUsers: []})),
  on(projectsActions.setAllProjectUsers, (state, action) => ({...state, allUsers: action.users})),
  on(projectsActions.setProjectExtraUsers, (state, action) => ({...state, extraUsers: action.users})),
  on(projectsActions.setShowHidden, (state, action) => ({...state, showHidden: action.show})),
  on(projectsActions.setHideExamples, (state, action) => ({...state, hideExamples: action.hide}))
);
export const selectShowHidden = createSelector(projects, selectSelectedProject,
  (state, selectedProject) => (state?.showHidden || selectedProject?.system_tags?.includes('hidden')));

export const selectHideExamples = createSelector(projects, state => state?.hideExamples);
