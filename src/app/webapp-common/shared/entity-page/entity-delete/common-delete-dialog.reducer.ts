import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as actions from './common-delete-dialog.actions';

export type CloudProviders = 'fs' | 'gc' | 's3' | 'azure' | 'misc'

export interface DeleteEntityDialog {
  numberOfSourcesToDelete: number;
  failedDelete: string[];
  failedEntitiesDelete: {id: string; name: string; message: string}[];
}

const deleteEntityInitState: DeleteEntityDialog = {
  numberOfSourcesToDelete: null,
  failedDelete: [],
  failedEntitiesDelete: []
};

export const selectDeleteEntityDialog = createFeatureSelector<DeleteEntityDialog>('deleteEntityDialog');
export const selectNumberOfSourcesToDelete = createSelector(selectDeleteEntityDialog, (state): number => state.numberOfSourcesToDelete);
export const selectFilesFailedToDelete = createSelector(selectDeleteEntityDialog, (state): string[] => state.failedDelete);
export const selectEntitiesFailedToDelete = createSelector(selectDeleteEntityDialog, (state): {id: string; name: string; message: string}[] => state.failedEntitiesDelete);

export function commonDeleteDialogReducer<ActionReducer>(state: DeleteEntityDialog = deleteEntityInitState, action): DeleteEntityDialog {
  switch (action.type) {
    case actions.setNumberOfSourcesToDelete.type:
      return {
        ...state,
        numberOfSourcesToDelete: action.numberOfFiles === -1 ? state.numberOfSourcesToDelete - 1 : action.numberOfFiles
      };
    case actions.addFailedDeletedFile.type:
      return {
        ...state,
        failedDelete: state.failedDelete.includes(action.filePath) ? state.failedDelete : [...state.failedDelete, action.filePath],
        numberOfSourcesToDelete: state.numberOfSourcesToDelete - 1
      };
    case actions.addFailedDeletedFiles.type:
      return {
        ...state,
        failedDelete: Array.from(new Set([...state.failedDelete, ...action.filePaths])).sort(),
        numberOfSourcesToDelete: state.numberOfSourcesToDelete - action.filePaths.length
      };
    case actions.setFailedDeletedEntities.type:
      return {
        ...state,
        failedEntitiesDelete: action.failedEntities
      };
    case actions.resetDeleteState.type:
      return {...state, failedDelete: [], numberOfSourcesToDelete: null, failedEntitiesDelete: []};
    default:
      return state;
  }
}
