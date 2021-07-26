import {createAction, props} from '@ngrx/store';
import { Task } from '../../../../business-logic/model/tasks/task';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {TasksResetManyResponseFailed} from '../../../../business-logic/model/tasks/tasksResetManyResponseFailed';

const DELETE_PREFIX = 'DELETE_ENTITY ';

export const deleteEntities = createAction( DELETE_PREFIX + '[delete entities]',
  props<{entityType: EntityTypeEnum; entity?: Task}>());

export const deleteModels = createAction( DELETE_PREFIX + '[delete models]');

export const setNumberOfSourcesToDelete = createAction(DELETE_PREFIX + '[set #files to delete]',
  props<{numberOfFiles: number}>());

export const addFailedDeletedFile = createAction(DELETE_PREFIX + '[add failed deleted file path]',
  props<{filePath: string}>());

export const addFailedDeletedFiles = createAction(DELETE_PREFIX + '[add failed deleted file paths]',
  props<{filePaths: string[]}>());

export const deleteFileServerSources = createAction(DELETE_PREFIX + '[delete file server sources]',
  props<{files: string[]}>());

export const deleteS3Sources = createAction(DELETE_PREFIX + '[delete s3 sources]',
  props<{files: string[]}>());

export const setFailedDeletedEntities = createAction(DELETE_PREFIX + '[set failed delete Entities]',
  props<{failedEntities: TasksResetManyResponseFailed[]}>());

export const resetDeleteState = createAction(DELETE_PREFIX + '[reset delete state]');
