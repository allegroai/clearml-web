import {ActionReducerMap, createSelector} from '@ngrx/store';
import {IModelsViewState, modelsInitialState, modelsViewReducer} from './models-view.reducer';
import {ModelInfoState, modelsInfoReducer} from './model-info.reducer';
import {SelectedModel} from '../shared/models.model';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {MODELS_TABLE_COLS} from '@common/models/models.consts';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
export const reducers: ActionReducerMap<any, any> = {
  view: modelsViewReducer,
  info: modelsInfoReducer,
};

const models = (state) => state.models;

// view selectors.
export const modelsView = createSelector(models, (state): IModelsViewState => state ? state.view : {});
export const selectModelsList = createSelector(modelsView, (state) => state.models);
export const selectCurrentScrollId = createSelector(modelsView, (state): string => state.scrollId);
export const selectGlobalFilter = createSelector(modelsView, (state) => state.globalFilter);
export const selectTableSortFields = createSelector(modelsView, selectRouterParams,
  (state, params) => state.projectColumnsSortOrder[params?.projectId] || modelsInitialState.tableSortFields);
export const selectTableFilters = createSelector(modelsView, selectRouterParams,
  (state, params) => state.projectColumnFilters?.[params?.projectId] || {});
export const selectSelectedModels = createSelector(modelsView, (state): Array<any> => state.selectedModels);
export const selectedModelsDisableAvailable = createSelector(modelsView, (state): Record<string, CountAvailableAndIsDisableSelectedFiltered> => state.selectedModelsDisableAvailable);
export const selectSelectedTableModel = createSelector(modelsView, (state): SelectedModel => state.selectedModel);
export const selectNoMoreModels = createSelector(modelsView, (state): boolean => state.noMoreModels);
export const selectShowAllSelectedIsActive = createSelector(modelsView, (state): boolean => state.showAllSelectedIsActive);
export const selectModelsTableColsOrder = createSelector(modelsView, selectRouterParams,
  (state, params): string[] => (state.colsOrder && params?.projectId) ? state.colsOrder[params?.projectId] : undefined);
export const selectModelsUsers = createSelector(modelsView, (state): Array<any> => state.users);
export const selectModelsFrameworks = createSelector(modelsView, (state): Array<string> => state.frameworks);
export const selectModelsTags = createSelector(modelsView, (state): Array<string> => state.projectTags);
export const selectModelsTableColsWidth = createSelector(modelsView, selectRouterParams,
  (state, params) => state.projectColumnsWidth?.[params?.projectId] || {});
export const selectModelsHiddenTableCols = createSelector(modelsView, selectRouterParams,
  (state, params) => state.hiddenProjectTableCols?.[params?.projectId] || modelsInitialState.hiddenTableCols);
export const selectModelTableColumns = createSelector(modelsView, selectModelsHiddenTableCols, selectModelsTableColsWidth,
  (state, hidden, colWidth) =>
  MODELS_TABLE_COLS.map(col => ({
    ...col,
    hidden: !!hidden[col.id],
    style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
  } as ISmCol)));
export const selectSplitSize = createSelector(modelsView, (state): number => state.splitSize);



// info selectors
export const modelInfo = createSelector(models, (state): ModelInfoState => state ? state.info : {});
export const selectSelectedModel = createSelector(modelInfo, (state): SelectedModel => state.selectedModel);
export const selectIsModelSaving = createSelector(modelInfo, (state): boolean => state.saving);
export const selectActiveSectionEdit = createSelector(modelInfo, (state): string => state.activeSectionEdit);
export const selectIsModelInEditMode = createSelector(modelInfo, (state): boolean => !!state.activeSectionEdit);
