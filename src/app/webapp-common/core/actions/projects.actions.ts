import {createAction, props} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {ProjectsUpdateRequest} from '~/business-logic/model/projects/projectsUpdateRequest';
import {ModelsPublishManyResponse} from '~/business-logic/model/models/modelsPublishManyResponse';
import {ModelsArchiveManyResponse} from '~/business-logic/model/models/modelsArchiveManyResponse';
import {ModelsDeleteManyResponse} from '~/business-logic/model/models/modelsDeleteManyResponse';
import {archivedSelectedModels} from '@common/models/actions/models-menu.actions';
import {TasksResetManyResponse} from '~/business-logic/model/tasks/tasksResetManyResponse';
import {TasksEnqueueManyResponse} from '~/business-logic/model/tasks/tasksEnqueueManyResponse';
import {TasksArchiveManyResponse} from '~/business-logic/model/tasks/tasksArchiveManyResponse';
import {TasksPublishManyResponse} from '~/business-logic/model/tasks/tasksPublishManyResponse';
import {TasksStopManyResponse} from '~/business-logic/model/tasks/tasksStopManyResponse';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {MetricColumn} from '@common/shared/utils/tableParamEncode';
import {ProjectStatsGraphData} from '@common/core/reducers/projects.reducer';
import {User} from '~/business-logic/model/users/user';

export const PROJECTS_PREFIX = '[ROOT_PROJECTS] ';

export interface TagColor {
  foreground: string;
  background: string;
}

export const getAllSystemProjects = createAction(
  PROJECTS_PREFIX + 'GET_PROJECTS'
);

export const updateProject = createAction(
  PROJECTS_PREFIX + 'UPDATE_PROJECT',
  props<{ id: string; changes: Partial<ProjectsUpdateRequest> }>()
);

export const setAllProjects = createAction(
  PROJECTS_PREFIX + 'SET_PROJECTS',
  props<{ projects: Project[]; updating?: boolean }>()
);

export const resetProjects = createAction(PROJECTS_PREFIX + 'RESET_PROJECTS');
export const refetchProjects = createAction(PROJECTS_PREFIX + 'REFETCH_PROJECTS');

export const setLastUpdate = createAction(
  PROJECTS_PREFIX + 'SET_LAST_UPDATE',
  props<{ lastUpdate: string }>());

export const updateProjectCompleted = createAction(
  PROJECTS_PREFIX + 'UPDATE_PROJECT_COMPLETED',
  props<{id: string; changes: Partial<Project>}>()
);

export const setSelectedProjectId = createAction(
  PROJECTS_PREFIX + 'SET_SELECTED_PROJECT_ID',
  props<{ projectId: string; example?: boolean }>()
);
export const deletedProjectFromRoot = createAction(
  PROJECTS_PREFIX + 'DELETE_PROJECT_FROM_ROOT',
  props<{ project: Project }>()
);
export const setSelectedProject = createAction(
  PROJECTS_PREFIX + 'SET_SELECTED_PROJECT',
  props<{ project: Project }>()
);

export const setSelectedProjectStats = createAction(
  PROJECTS_PREFIX + '[set selected project statistics]',
  props<{ project: Project }>()
);

export const resetSelectedProject = createAction(
  PROJECTS_PREFIX + 'RESET_SELECTED_PROJECT'
);

export const resetProjectSelection = createAction(
  PROJECTS_PREFIX + 'RESET_PROJECT_SELECTION'
);

export const setArchive = createAction(
  PROJECTS_PREFIX + 'SET_ARCHIVE',
  props<{ archive: boolean }>()
);

export const setDeep = createAction(
  PROJECTS_PREFIX + 'SET_DEEP',
  props<{ deep: boolean }>()
);

export const getTags = createAction(
  PROJECTS_PREFIX + '[get tags]',
  (project = null) => ({projectId: project})
);

export const getCompanyTags = createAction(
  PROJECTS_PREFIX + '[get company tags]'
);

export const getProjectsTags = createAction(
  PROJECTS_PREFIX + '[get projects tags]'
);

export const setTagsFilterByProject = createAction(
  PROJECTS_PREFIX + '[set tags filter by project]',
  props<{ tagsFilterByProject: boolean }>()
);

export const setTags = createAction(
  PROJECTS_PREFIX + '[set tags]',
  props<{ tags: string[] }>()
);

export const setCompanyTags = createAction(
  PROJECTS_PREFIX + '[set company tags]',
  props<{ tags: string[]; systemTags: string[] }>()
);

export const setMainPageTagsFilter = createAction(
  PROJECTS_PREFIX + '[set main page tags filters]',
  props<{ tags: string[] }>()
);

export const setMainPageTagsFilterMatchMode = createAction(
  PROJECTS_PREFIX + '[set main page tags filters match mode]',
  props<{ matchMode: string }>()
);

export const addProjectTags = createAction(
  PROJECTS_PREFIX + '[add all projects tags]',
  props<{ tags: string[]; systemTags: string[] }>()
);

export const openTagColorsMenu = createAction(
  PROJECTS_PREFIX + '[open tag colors]'
);

export const setTagColors = createAction(
  PROJECTS_PREFIX + '[set tag colors]',
  props<{ tag: string; colors: TagColor }>()
);

export const openMoreInfoPopup = createAction(
  PROJECTS_PREFIX + '[open more info popup]',
  props<{ parentAction: ReturnType<typeof archivedSelectedModels>; operationName: string; entityType: EntityTypeEnum; res: ModelsPublishManyResponse | ModelsArchiveManyResponse | ModelsDeleteManyResponse | TasksResetManyResponse | TasksEnqueueManyResponse | TasksArchiveManyResponse | TasksPublishManyResponse | TasksStopManyResponse }>()
);

export const setMetricVariant = createAction(
  PROJECTS_PREFIX + '[set selected metric variant for graph]',
  props<{ projectId: string; col: MetricColumn }>()
);
export const fetchGraphData = createAction(PROJECTS_PREFIX + '[fetch stats for project graph]');

export const setGraphData = createAction(
  PROJECTS_PREFIX + '[set project stats]',
  props<{ stats: ProjectStatsGraphData[] }>()
);

export const getProjectUsers = createAction(
  PROJECTS_PREFIX + '[get current project users]',
  props<{projectId: string}>()
);
export const setProjectUsers = createAction(
  PROJECTS_PREFIX + '[set current project users]',
  props<{users: User[]}>()
);
export const setAllProjectUsers = createAction(
  PROJECTS_PREFIX + '[set all projects users]',
  props<{users: User[]}>()
);
export const setProjectExtraUsers = createAction(
  PROJECTS_PREFIX + '[set extra users]',
  props<{users: User[]}>()
);
export const getFilteredUsers = createAction(
  PROJECTS_PREFIX + 'GET_FILTERED_USERS',
  props<{filteredUsers: string[]}>()
);
export const setShowHidden = createAction(
  PROJECTS_PREFIX + ' [set show hidden]',
  props<{ show: boolean }>()
);

export const setHideExamples = createAction(
  PROJECTS_PREFIX + ' [set hide examples]',
  props<{ hide: boolean }>()
);
