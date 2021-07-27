import {Action, createAction, props} from '@ngrx/store';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {ExperimentsViewModesEnum} from '../shared/common-experiments.const';
import {MetricVariantResult} from '../../../business-logic/model/projects/metricVariantResult';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {ProjectsGetTaskParentsResponseParents} from '../../../business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {TasksEnqueueManyResponseSucceeded} from '../../../business-logic/model/tasks/tasksEnqueueManyResponseSucceeded';
import {EXPERIMENTS_INFO_PREFIX} from '@common/experiments/actions/common-experiments-menu.actions';

export const EXPERIMENTS_PREFIX = 'EXPERIMENTS_';

// COMMANDS:
export const getExperiments = createAction(EXPERIMENTS_PREFIX + ' [get experiments]');
export const getNextExperiments = createAction(EXPERIMENTS_PREFIX + '[get next experiments]');

export const refreshExperiments = createAction(
  EXPERIMENTS_PREFIX + ' [refresh experiment]',
  props<{ hideLoader: boolean; autoRefresh?: boolean}>()
);

export const setExperiments = createAction(
  EXPERIMENTS_PREFIX + ' [set experiments]',
  props<{experiments: ITableExperiment[]}>()
);

export const setExperimentInPlace = createAction(
  EXPERIMENTS_PREFIX + '[set experiment in place]',
  props<{ experiments: ITableExperiment[] }>()
);

export const setNoMoreExperiments =createAction(
  EXPERIMENTS_PREFIX + ' [set no more experiments]',
  props<{payload: boolean}>()
);

export const addExperiments = createAction(
  EXPERIMENTS_PREFIX + ' [add many experiments]',
  props<{experiments: ITableExperiment[]}>()
);

export const removeExperiments = createAction(
  EXPERIMENTS_PREFIX + ' [remove many experiments]',
  props<{experiments: string[]}>()
);

export const updateExperiment = createAction(
  EXPERIMENTS_PREFIX + ' [update experiment]',
  props<{id: string; changes: Partial<ITableExperiment>}>()
);

export const updateManyExperiment = createAction(
  EXPERIMENTS_PREFIX + 'update many experiments',
  props<{changeList: TasksEnqueueManyResponseSucceeded[] }>()
);

export const setSelectedExperiments = createAction(
  EXPERIMENTS_PREFIX + ' [set selected experiments]',
  props<{experiments: ITableExperiment[]}>()
);

export const setSelectedExperiment = createAction(
  EXPERIMENTS_PREFIX + ' [set selected experiment]',
  props<{experiment: ITableExperiment}>()
);

export const experimentSelectionChanged = createAction(
  EXPERIMENTS_PREFIX + ' [experiment selection changed]',
  props<{experiment: {id?: string}; project?: string}>()
);

export const toggleColHidden = createAction(
  EXPERIMENTS_PREFIX + ' [toggle column hidden state]',
  props<{columnId: string; projectId: string}>()
);

export const setHiddenColumns = createAction(
  EXPERIMENTS_PREFIX + 'SET_HIDDEN_COLS',
  props<{ visibleColumns: string[]; projectId: string }>()
);

export const setUsers = createAction(
  EXPERIMENTS_PREFIX + 'SET_USERS',
  props<{ users: User[] }>()
);

export const setParents = createAction(
  EXPERIMENTS_PREFIX + '[set project experiment parents]',
  props<{ parents: ProjectsGetTaskParentsResponseParents[]}>()
);

export const setActiveParentsFilter = createAction(
  EXPERIMENTS_PREFIX + '[set active parents filter]',
  props<{ parents: ProjectsGetTaskParentsResponseParents[]}>()
);

export const getUsers = createAction(EXPERIMENTS_PREFIX + 'GET_USERS');
export const getParents = createAction(EXPERIMENTS_PREFIX + '[get project experiments parents]');
export const getFilteredUsers = createAction(EXPERIMENTS_PREFIX + 'GET_FILTERED_USERS');

export const tableFilterChanged = createAction(
  EXPERIMENTS_PREFIX + '[table filter changed]',
  props<{filter: TableFilter; projectId: string}>()
);

export const tableSortChanged = createAction(
  EXPERIMENTS_PREFIX + ' [table sort changed]',
  props<{ isShift: boolean; colId: ISmCol['id'] }>()
);

export const setTableSort = createAction(
  EXPERIMENTS_PREFIX + ' [set table sort]',
  props<{ orders: SortMeta[]; projectId: string }>()
);

export const setTableFilters = createAction(
  EXPERIMENTS_PREFIX + ' [set table filters]',
  props<{ filters: TableFilter[]; projectId: string }>()
);

export const setProjectsTypes = createAction(
  EXPERIMENTS_PREFIX + 'SET_PROJECT_TYPES',
  props<{ types?: Array<string> }>()
);

export const getProjectTypes = createAction(EXPERIMENTS_PREFIX + 'GET_PROJECT_TYPES');

export const showOnlySelected = createAction(
  EXPERIMENTS_PREFIX + ' [show only selected]',
  props<{active: boolean; projectId: string}>()
);

export const globalFilterChanged = createAction(
  EXPERIMENTS_PREFIX + 'GLOBAL_FILTER_CHANGED',
  props<{query: string; regExp?: boolean}>()
);

export const resetGlobalFilter = createAction(EXPERIMENTS_PREFIX + 'RESET_GLOBAL_FILTER');

export const setCurrentPage= createAction(
  EXPERIMENTS_PREFIX + ' [set current page]',
  props<{page: number}>()
);

export const resetExperiments = createAction(EXPERIMENTS_PREFIX + ' [reset experiments]');
export const getCustomMetrics = createAction(EXPERIMENTS_PREFIX + ' [get custom metrics]');
export const getCustomHyperParams = createAction(EXPERIMENTS_PREFIX + ' [get custom hyper parameter]');

export const setCustomMetrics = createAction(
  EXPERIMENTS_PREFIX + ' [set custom metrics]',
  props<{metrics: MetricVariantResult[]}>()
);
export const setCustomHyperParams = createAction(
  EXPERIMENTS_PREFIX + ' [set custom hyper params]',
  props<{params: any[]}>()
);

export const setExtraColumns = createAction(
  EXPERIMENTS_PREFIX + 'SET_EXTRA_COLUMNS',
  props<{ columns: any[] ; projectId: string }>()
);

export const addColumn = createAction(
  EXPERIMENTS_PREFIX + ' [ add column]',
  props<{col: ISmCol}>()
);

export const removeCol = createAction(
  EXPERIMENTS_PREFIX + ' [remove column]',
  props<{ id: string; projectId: string }>()
);

export const setColumnWidth = createAction(
  EXPERIMENTS_PREFIX + ' [set column width]',
  props<{projectId: string; columnId: string; widthPx: number}>()
);

export const setColsOrderForProject = createAction(
  EXPERIMENTS_PREFIX + ' [set cols order]',
  props<{ cols: string[]; project: string; fromUrl?: boolean }>()
);

export const clearHyperParamsCols = createAction(
  EXPERIMENTS_PREFIX + ' [Clear HyperParam Cols]',
  props<{projectId: string}>()
);

export const resetSortOrder = createAction(
  EXPERIMENTS_PREFIX + 'RESET_SORT_ORDER',
  props<{sortIndex: number; projectId: string}>()
);

export const setArchive = createAction(
  EXPERIMENTS_PREFIX + 'SET_ARCHIVE',
  props<{ archive: boolean }>()
);

export const afterSetArchive = createAction(EXPERIMENTS_PREFIX + 'AFTER_SET_ARCHIVE');

export const setSplitSize = createAction(EXPERIMENTS_PREFIX + 'SET_SPLIT_SIZE', props<{ splitSize: number }>());

export const hyperParamSelectedInfoExperiments = createAction(
  EXPERIMENTS_PREFIX + '[hyper param option add filter experiments]',
  props<{ col: ISmCol; values: string[] }>()
);

export const hyperParamSelectedExperiments = createAction(
  EXPERIMENTS_INFO_PREFIX + '[hyper param selected in the menu filter experiments]',
  props<{ col: ISmCol }>()
);

export const getTags = createAction(EXPERIMENTS_PREFIX + ' [get experiments tags]');

export const setTags = createAction(
  EXPERIMENTS_PREFIX + 'SET_TAGS',
  props<{ tags: string[] }>()
);
export const setSelectedExperimentsDisableAvailable = createAction(
  EXPERIMENTS_PREFIX + 'setSelectedExperimentsDisableAvailable',
  props<{ selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> }>()
);
