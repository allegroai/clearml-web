import {ActionReducerMap, createSelector} from '@ngrx/store';
import {IModelsViewState, modelsInitialState, modelsViewReducer} from './models-view.reducer';
import {ModelInfoState, modelsInfoReducer} from './model-info.reducer';
import {SelectedModel} from '../shared/models.model';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {MODELS_TABLE_COLS} from '@common/models/models.consts';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {selectSelectedProjectId} from '@common/core/reducers/projects.reducer';

export interface ModelsState {
  view: IModelsViewState;
  info: ModelInfoState;
}

export const reducers: ActionReducerMap<ModelsState, any> = {
  view: modelsViewReducer,
  info: modelsInfoReducer,
};

const models = (state) => state.models;

// view selectors.
export const selectModelsView = createSelector(models, (state): IModelsViewState => state ? state.view : {});
export const selectModelsList = createSelector(selectModelsView, (state) => state.models);
export const selectCurrentScrollId = createSelector(selectModelsView, (state): string => state.scrollId);
export const selectGlobalFilter = createSelector(selectModelsView, (state) => state.globalFilter);
export const selectTableSortFields = createSelector(selectModelsView, selectSelectedProjectId,
  (state, projectId) => state.projectColumnsSortOrder[projectId] || modelsInitialState.tableSortFields);
export const selectTableFilters = createSelector(selectModelsView, selectSelectedProjectId,
  (state, projectId) => state.projectColumnFilters?.[projectId] || {});
export const selectSelectedModels = createSelector(selectModelsView, (state): Array<any> => state.selectedModels);
export const selectSelectedModelsDisableAvailable = createSelector(selectModelsView, (state): Record<string, CountAvailableAndIsDisableSelectedFiltered> => state.selectedModelsDisableAvailable);
export const selectSelectedTableModel = createSelector(selectModelsView, (state): SelectedModel => state.selectedModel);
export const selectNoMoreModels = createSelector(selectModelsView, (state): boolean => state.noMoreModels);
export const selectShowAllSelectedIsActive = createSelector(selectModelsView, (state): boolean => state.showAllSelectedIsActive);
export const selectModelsTableColsOrder = createSelector(selectModelsView, selectSelectedProjectId,
  (state, projectId): string[] => (state.colsOrder && projectId) ? state.colsOrder[projectId] : undefined);
export const selectModelsFrameworks = createSelector(selectModelsView, (state): Array<string> => state.frameworks);
export const selectModelsTags = createSelector(selectModelsView, (state): Array<string> => state.projectTags);
export const selectMetadataKeys = createSelector(selectModelsView, (state): Array<string> => state.projectMetadataKeys);
export const selectMetadataColsOptions = createSelector(selectModelsView, (state): Record<ISmCol['id'], string[]> => state.metadataColsOptions);
export const selectMetricVariants = createSelector(selectModelsView, (state): MetricVariantResult[] => state.metricVariants);

export const selectModelsTableColsWidth = createSelector(selectModelsView, selectSelectedProjectId,
  (state, projectId) => state.projectColumnsWidth?.[projectId] || {});

export const selectModelsHiddenTableCols = createSelector(selectModelsView, selectSelectedProjectId,
  (state, projectId) => state.hiddenProjectTableCols?.[projectId] || modelsInitialState.hiddenTableCols);
export const selectModelTableColumns = createSelector(selectModelsHiddenTableCols, selectModelsTableColsWidth,
  (hidden, colWidth) =>
  MODELS_TABLE_COLS.map(col => ({
    ...col,
    hidden: !!hidden[col.id],
    style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
  } as ISmCol)));
export const selectMetadataColumns = createSelector(selectModelsView, state=> state.metadataCols);
export const selectMetadataColsForProject = createSelector(selectMetadataColumns, selectSelectedProjectId, selectModelsHiddenTableCols, selectModelsTableColsWidth, (metadataCols, projectId, hidden, colWidth) =>
  metadataCols
    .filter(metaCol => metaCol.projectId === projectId)
    .map(col => ({
      ...col,
      hidden: !!hidden[col.id],
      style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
    } as ISmCol)));
export const selectSplitSize = createSelector(selectModelsView, (state): number => state.splitSize);
export const selectTableMode = createSelector(selectModelsView, state => state.tableMode);



// info selectors
export const selectModelInfo = createSelector(models, (state): ModelInfoState => state ? state.info : {});
export const selectSelectedModel = createSelector(selectModelInfo, (state): SelectedModel => state.selectedModel);
export const selectIsModelSaving = createSelector(selectModelInfo, (state): boolean => state.saving);
export const selectActiveSectionEdit = createSelector(selectModelInfo, state => state.activeSectionEdit);
export const selectIsModelInEditMode = createSelector(selectModelInfo, (state): boolean => !!state.activeSectionEdit);
export const selectModelExperimentsTableFilters = createSelector(selectModelInfo, state => state.modelExperimentsTableFilter);

export const selectModelPlots = createSelector(selectModelInfo, state => state.plots);

export const selectModesPage = createSelector(selectRouterConfig, config => config[0] === 'models');
export const selectModelId = createSelector(selectRouterParams, params => params?.modelId);
export const selectProjectId = createSelector(selectModesPage, selectSelectedProjectId, (modelsPage, projectId) => modelsPage ? '*' : projectId);
