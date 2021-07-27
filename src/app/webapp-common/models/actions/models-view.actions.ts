import {createAction, props} from '@ngrx/store';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {SelectedModel} from '../shared/models.model';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
const MODELS_PREFIX = 'MODELS_';

export const fetchModelsRequested = createAction(MODELS_PREFIX + '[fetch models requested]');

export const refreshModels = createAction(
  MODELS_PREFIX + '[refresh models]',
  props<{ hideLoader: boolean; autoRefresh: boolean }>()
);

export const getNextModels = createAction(MODELS_PREFIX + '[get next model]');
export const setModels = createAction(
  MODELS_PREFIX + '[set models]',
  props<{models: SelectedModel[]}>()
);

export const setModelsInPlace = createAction(
  MODELS_PREFIX + '[set models in place]',
  props<{ models: SelectedModel[] }>()
);

export const setNoMoreModels = createAction(
  MODELS_PREFIX + '[set no more models]',
  props<{ payload: boolean }>()
);

export const toggleColHidden = createAction(
  MODELS_PREFIX + 'TOGGLE_COL_HIDDEN',
  props<{columnId: string; projectId: string}>()
);

export const getTags = createAction(
  MODELS_PREFIX + 'GET_TAGS');

export const setTags = createAction(
  MODELS_PREFIX + 'SET_TAGS',
  props<{ tags: string[] }>()
);

export const setHiddenCols = createAction(
  MODELS_PREFIX + 'SET_HIDDEN_COLS',
  props<{ hiddenCols: { [key: string]: boolean } }>()
);

export const setColsOrderForProject = createAction(
  MODELS_PREFIX + 'SET_COLS_ORDER',
  props<{ cols: string[]; project: string; fromUrl?: boolean }>()
);

export const setUsers = createAction(
  MODELS_PREFIX + 'SET_USERS',
  props<{ users: User[] }>()
);

export const getUsers = createAction(MODELS_PREFIX + 'GET_USERS');

export const setFrameworks = createAction(
  MODELS_PREFIX + 'SET_FRAMEWORKS',
  props<{ frameworks: string[] }>()
);

export const getFrameworks = createAction(
  MODELS_PREFIX + 'GET_FRAMEWORKS');

export const getFilteredUsers = createAction(
  MODELS_PREFIX + 'GET_FILTERED_USERS');

export const addModels = createAction(
  MODELS_PREFIX + '[add models]',
  props<{models: SelectedModel[] }>()
);

export const removeModels = createAction(
  MODELS_PREFIX + '[remove models]',
  props<{modelIds: string[] }>()
);

export const updateModel = createAction(
  MODELS_PREFIX + '[update model]',
  props<{id: SelectedModel['id']; changes: Partial<SelectedModel>}>()
);

export const setSelectedModels = createAction(
  MODELS_PREFIX + '[set selected models]',
  props<{models: SelectedModel[] }>()
);

export const setSelectedModel = createAction(
  MODELS_PREFIX + '[set selected model]',
  props<{model: SelectedModel }>()
);

export const tableSortChanged = createAction(
  MODELS_PREFIX + 'TABLE_SORT_CHANGED',
  props<{ isShift: boolean; colId: ISmCol['id'] }>()
);

export const setTableSort = createAction(
  MODELS_PREFIX + 'SET_TABLE_SORT',
  props<{orders: SortMeta[]; projectId: string}>()
);

export const tableFilterChanged= createAction(
  MODELS_PREFIX + '[table filters changed]',
  props<{filter: TableFilter; projectId: string}>()
);

export const setTableFilters = createAction(
  MODELS_PREFIX + 'SET_TABLE_FILTERS',
  props<{filters: TableFilter[]; projectId: string}>()
);

export const setColumnWidth = createAction(
  MODELS_PREFIX + ' [set column width]',
  props<{projectId: string; columnId: string; widthPx: number}>()
);


export const modelSelectionChanged = createAction(
  MODELS_PREFIX + '[model selection changed]',
  props<{ model: SelectedModel; project?: string }>()
);

export const showSelectedOnly = createAction(
  MODELS_PREFIX + '[show selected only]',
  props<{ active: boolean; projectId: string }>()
);

export const globalFilterChanged = createAction(
  MODELS_PREFIX + 'GLOBAL_FILTER_CHANGED',
  props<{query: string; regExp?: boolean}>()
);

export const resetGlobalFilter = createAction(MODELS_PREFIX + 'RESET_GLOBAL_FILTER');
export const resetState = createAction(MODELS_PREFIX + '[reset state]');

export const setCurrentPage = createAction(
  MODELS_PREFIX + '[set current page]',
  props<{page: number}>()
);

export const setArchive = createAction(
  MODELS_PREFIX + 'SET_ARCHIVE',
  props<{ archive: boolean }>()
);

export const afterSetArchive = createAction(MODELS_PREFIX + 'AFTER_SET_ARCHIVE');

export const setSplitSize = createAction(MODELS_PREFIX + 'SET_SPLIT_SIZE', props<{ splitSize: number }>());
export const setSelectedModelsDisableAvailable = createAction(
  MODELS_PREFIX + 'setSelectedModelsDisableAvailable',
  props<{ selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> }>()
);
