import {createSelector} from '@ngrx/store';
import * as projectsActions from '../actions/projects.actions';
import {setTagColors, setTags, TagColor} from '../actions/projects.actions';
import {Project} from '../../../business-logic/model/projects/project';
import {getSystemTags} from '../../../features/experiments/shared/experiments.utils';

export const SYSTEM_TAGS_BLACK_LIST = ['archived'];

interface RootProjects {
  projects: Project[];
  selectedProject: Project;
  archive: boolean;
  tags: string[];
  systemTags: string[];
  tagsColors: { [tag: string]: TagColor };
}

const initRootProjects: RootProjects = {
  projects       : [],
  selectedProject: null,
  archive        : false,
  tags           : [],
  systemTags     : [],
  tagsColors     : {}
};

export const projects = state => state.rootProjects as RootProjects;
export const selectProjects = createSelector(projects, (state): Project[] =>  state.projects);
export const selectSelectedProject = createSelector(projects, state => state.selectedProject);
export const selectSelectedProjectId = createSelector(selectSelectedProject, (selectedProject): string => selectedProject ? selectedProject.id : '');
export const selectIsArchivedMode = createSelector(projects, state => state.archive);
export const selectProjectTags = createSelector(projects, state => state.tags);
export const selectProjectSystemTags = createSelector(projects, state => getSystemTags({system_tags: state.systemTags}));
export const selectTagsColors = createSelector(projects, state => state.tagsColors);
export const selectTagColors = createSelector(selectTagsColors,
  (tagsColors, props: { tag: string }) => tagsColors[props.tag]);


export function projectsReducer(state: RootProjects = initRootProjects, action) {
  switch (action.type) {
    case projectsActions.SET_PROJECTS:
      return {...state, projects: action.payload};
    case projectsActions.SET_SELECTED_PROJECT:
      return {...state, selectedProject: action.payload.project};
    case projectsActions.RESET_SELECTED_PROJECT:
      return {...state, selectedProject: initRootProjects.selectedProject};
    case projectsActions.UPDATE_PROJECT: {
      const newSelectedProject = Object.assign({}, {...state.selectedProject, ...action.payload.changes});
      return {...state, selectedProject: newSelectedProject};
    }
    case projectsActions.setArchive.type:
      return {...state, archive: action.archive};
    case setTags.type:
      return {...state, tags: action.tags, systemTags: action.systemTags};
    case setTagColors.type:
      return {...state, tagsColors: {...state.tagsColors, [action.tag]: action.colors}};
    default:
      return state;
  }
}
