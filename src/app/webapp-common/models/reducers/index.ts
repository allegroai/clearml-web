import {ActionReducerMap, createSelector} from '@ngrx/store';
import {IModelsViewState, modelsViewReducer} from './models-view.reducer';
import {ModelInfoState, modelsInfoReducer} from './model-info.reducer';
import {SelectedModel} from '../shared/models.model';
import {ModelsViewModesEnum} from '../models.consts';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';
import {SortMeta} from 'primeng/api';
import {
  CountAvailableAndIsDisable,
  CountAvailableAndIsDisableSelectedFiltered
} from '@common/shared/entity-page/items.utils';

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
export const selectGlobalFilter = createSelector(modelsView, (state) => state.globalFilter);
export const selectTableSortFields = createSelector(modelsView, (state): SortMeta[] => state.tableSortFields);
export const selectTableFilters = createSelector(modelsView, state => state.tableFilters);
export const selectViewMode = createSelector(modelsView, (state): ModelsViewModesEnum => state.viewMode);
export const selectSelectedModels = createSelector(modelsView, (state): Array<any> => state.selectedModels);
export const selectedModelsDisableAvailable = createSelector(modelsView, (state): Record<string, CountAvailableAndIsDisableSelectedFiltered> => state.selectedModelsDisableAvailable);
export const selectSelectedTableModel = createSelector(modelsView, (state): SelectedModel => state.selectedModel);
export const selectNoMoreModels = createSelector(modelsView, (state): boolean => state.noMoreModels);
export const selectShowAllSelectedIsActive = createSelector(modelsView, (state): boolean => state.showAllSelectedIsActive);
export const selectModelsTableColsOrder = createSelector([modelsView, selectSelectedProjectId], (state, projectId): string[] => (state.colsOrder && projectId) ? state.colsOrder[projectId] : undefined);
export const selectModelsUsers = createSelector(modelsView, (state): Array<any> => state.users);
export const selectModelsFrameworks = createSelector(modelsView, (state): Array<string> => state.frameworks);
export const selectModelsTags = createSelector(modelsView, (state): Array<string> => state.projectTags);
export const selectModelsHiddenTableCols = createSelector(modelsView, state => state.hiddenTableCols);
export const selectSplitSize = createSelector(modelsView, (state): number => state.splitSize);



// info selectors
export const modelInfo = createSelector(models, (state): ModelInfoState => state ? state.info : {});
export const selectSelectedModel = createSelector(modelInfo, (state): SelectedModel => state.selectedModel);
export const selectIsModelSaving = createSelector(modelInfo, (state): boolean => state.saving);
export const selectActiveSectionEdit = createSelector(modelInfo, (state): string => state.activeSectionEdit);
export const selectIsModelInEditMode = createSelector(modelInfo, (state): boolean => !!state.activeSectionEdit);
