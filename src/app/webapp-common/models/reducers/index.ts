import {ActionReducerMap, createSelector} from '@ngrx/store';
import {IModelsViewState, modelsViewReducer} from './models-view.reducer';
import {IModelInfoState, modelsInfoReducer} from './model-info.reducer';
import {ISelectedModel, ITableModel, ModelTableColFieldsEnum} from '../shared/models.model';
import {ModelsViewModesEnum} from '../models.consts';
import {TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';

export const reducers: ActionReducerMap<any, any> = {
  view: modelsViewReducer,
  info: modelsInfoReducer,
};

function models(state) {
  return state.models;
}

// view selectors.
export const modelsView = createSelector(models, (state): IModelsViewState => state ? state.view : {});
export const selectModelsList = createSelector(modelsView, (state) => state.models);
export const selectCurrentPage = createSelector(modelsView, (state): number => state.page);
export const selectGlobalFilter = createSelector(modelsView, (state): string => state.globalFilter);
export const selectTableSortField = createSelector(modelsView, (state): string => state.tableSortField);
export const selectTableSortOrder = createSelector(modelsView, (state): TableSortOrderEnum => state.tableSortOrder);
export const selectTableFilters = createSelector(modelsView, (state): Map<ModelTableColFieldsEnum, FilterMetadata> => state.tableFilters);
export const selectViewMode = createSelector(modelsView, (state): ModelsViewModesEnum => state.viewMode);
export const selectSelectedModels = createSelector(modelsView, (state): Array<any> => state.selectedModels);
export const selectSelectedTableModel = createSelector(modelsView, (state): ITableModel => state.selectedModel);
export const selectNoMoreModels = createSelector(modelsView, (state): boolean => state.noMoreModels);
export const selectShowAllSelectedIsActive = createSelector(modelsView, (state): boolean => state.showAllSelectedIsActive);
export const selectModelsTableColsOrder = createSelector([modelsView, selectSelectedProjectId], (state, projectId): string[] => (state.colsOrder && projectId) ? state.colsOrder[projectId] : undefined);
export const selectModelsUsers = createSelector(modelsView, (state): Array<any> => state.users);
export const selectModelsHiddenTableCols = createSelector(modelsView, (state): { [key: string]: boolean } => state.hiddenTableCols);



// info selectors
export const modelInfo = createSelector(models, (state): IModelInfoState => state ? state.info : {});
export const selectSelectedModel = createSelector(modelInfo, (state): ISelectedModel => state.selectedModel);
export const selectIsModelSaving = createSelector(modelInfo, (state): boolean => state.saving);
export const selectActiveSectionEdit = createSelector(modelInfo, (state): string => state.activeSectionEdit);
export const selectIsModelInEditMode = createSelector(modelInfo, (state): boolean => !!state.activeSectionEdit);
