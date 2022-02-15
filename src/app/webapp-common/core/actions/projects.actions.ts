import {createAction, props} from '@ngrx/store';
import {Project} from '../../../business-logic/model/projects/project';
import {ProjectsUpdateRequest} from '../../../business-logic/model/projects/projectsUpdateRequest';
import {ModelsPublishManyResponse} from '../../../business-logic/model/models/modelsPublishManyResponse';
import {ModelsArchiveManyResponse} from '../../../business-logic/model/models/modelsArchiveManyResponse';
import {ModelsDeleteManyResponse} from '../../../business-logic/model/models/modelsDeleteManyResponse';
import {archivedSelectedModels} from '@common/models/actions/models-menu.actions';
import {TasksResetManyResponse} from '../../../business-logic/model/tasks/tasksResetManyResponse';
import {TasksEnqueueManyResponse} from '../../../business-logic/model/tasks/tasksEnqueueManyResponse';
import {TasksArchiveManyResponse} from '../../../business-logic/model/tasks/tasksArchiveManyResponse';
import {TasksPublishManyResponse} from '../../../business-logic/model/tasks/tasksPublishManyResponse';
import {TasksStopManyResponse} from '../../../business-logic/model/tasks/tasksStopManyResponse';
import {EntityTypeEnum} from '../../../shared/constants/non-common-consts';
import {MetricColumn} from '@common/shared/utils/tableParamEncode';
import {ProjectStatsGraphData} from '@common/core/reducers/projects.reducer';

export const PROJECTS_PREFIX = '[ROOT_PROJECTS] ';
export const SET_PROJECTS = PROJECTS_PREFIX + 'SET_PROJECTS';
export const RESET_PROJECTS = PROJECTS_PREFIX + 'RESET_PROJECTS';
export const SET_LAST_UPDATE = PROJECTS_PREFIX + 'SET_LAST_UPDATE';
export const RESET_SELECTED_PROJECT = PROJECTS_PREFIX + 'RESET_SELECTED_PROJECT';
export const RESET_PROJECT_SELECTION = PROJECTS_PREFIX + 'RESET_PROJECT_SELECTION';
export const UPDATE_PROJECT = PROJECTS_PREFIX + 'UPDATE_PROJECT';

export interface TagColor {
  foreground: string;
  background: string;
}

export const getAllSystemProjects = createAction(
  PROJECTS_PREFIX + 'GET_PROJECTS'
);

export const updateProject = createAction(
  UPDATE_PROJECT,
  props<{ id: string; changes: Partial<ProjectsUpdateRequest> }>()
);

export const setAllProjects = createAction(
  SET_PROJECTS,
  props<{ projects: Project[]; updating?: boolean }>()
);

export const resetProjects = createAction(RESET_PROJECTS);

export const setLastUpdate = createAction(
  SET_LAST_UPDATE,
  props<{ lastUpdate: string }>());

export const updateProjectCompleted = createAction(
  PROJECTS_PREFIX + 'UPDATE_PROJECT_COMPLETED'
);

export const setSelectedProjectId = createAction(
  PROJECTS_PREFIX + 'SET_SELECTED_PROJECT_ID',
  props<{ projectId: string; example?: boolean }>()
);

export const setSelectedProject = createAction(
  PROJECTS_PREFIX + 'SET_SELECTED_PROJECT',
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
  PROJECTS_PREFIX + '[get tags]'
);

export const getCompanyTags = createAction(
  PROJECTS_PREFIX + '[get company tags]'
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
