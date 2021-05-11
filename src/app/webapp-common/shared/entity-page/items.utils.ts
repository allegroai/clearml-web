import {isReadOnly} from '../utils/shared-utils';
import {TaskStatusEnum} from '../../../business-logic/model/tasks/taskStatusEnum';
import {BlTasksService} from '../../../business-logic/services/tasks.service';

const blTasksService = new BlTasksService();

export interface CountAvailableAndIsDisable {
  available: number;
  disable: boolean;
}
export interface CountAvailableAndIsDisableSelectedFiltered extends CountAvailableAndIsDisable {
  selectedFiltered: Array<any>
}

export const countAvailableAndIsDisable = (selectedFiltered: any[]) => ({
    available: selectedFiltered.length,
    disable:  selectedFiltered.length === 0
  });

export const selectionHasExample = (selecteds: Array<any>) => selecteds.some((exp => isReadOnly(exp)));
export const selectionAllHasExample = (selecteds: Array<any>) => selecteds.every((exp => isReadOnly(exp)));
export const selectionAllIsArchive = (selecteds: Array<any>) => selecteds.every( s => s?.system_tags?.includes('archived'));
export const selectionIsArchive = (selecteds: any) => selecteds?.system_tags?.includes('archived');
export const selectionExamplesCount = (selecteds: any) => selecteds.filter((exp => isReadOnly(exp)));

export const selectionDisabledAbort = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter( (_selected) => TaskStatusEnum.InProgress === _selected?.status  && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledPublishExperiments = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => ([TaskStatusEnum.Stopped, TaskStatusEnum.Closed, 'completed', TaskStatusEnum.Failed].includes(_selected?.status)  && !isReadOnly(_selected)) );
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledPublishModels = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => (!isReadOnly(_selected) && !_selected?.ready) );
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledReset = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => ![TaskStatusEnum.Created, TaskStatusEnum.Published, TaskStatusEnum.Publishing].includes(_selected?.status)  && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledDelete = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected =>  selectionIsArchive(_selected) && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledMoveTo = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected =>  !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledQueue = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => _selected?.status === TaskStatusEnum.Queued && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledViewWorker = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => _selected?.status === TaskStatusEnum.InProgress && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};

export const selectionDisabledEnqueue = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => blTasksService.canEnqueue(_selected) && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledDequeue = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => blTasksService.canDequeue(_selected) && !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledArchive = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};
export const selectionDisabledTags = (selecteds: Array<any>) => {
  const selectedFiltered = selecteds.filter(_selected => !isReadOnly(_selected));
  return {selectedFiltered, ...countAvailableAndIsDisable(selectedFiltered)};
};

export const selectionTags = <T extends {tags?: string[]}>(selecteds: Array<T>): string[] => {
  const _selectedTags = {};
  selecteds.forEach( _selected => {
    _selected?.tags?.forEach( tag => {
      if (!_selectedTags[tag]) {
        _selectedTags[tag] = 1;
      } else {
        _selectedTags[tag]++;
      }
    });
  });
  return  Object.entries(_selectedTags)
    .filter(([_tag, amount]) => {
      return amount === selecteds.length;
    })
    .map( ([tag]) => tag);
};

export enum MENU_ITEM_ID {
  ABORT = 'abort',
  ARCHIVE = 'archive',
  COMPARE = 'compare',
  DELETE = 'delete',
  ENQUEUE = 'enqueue',
  DEQUEUE = 'dequeue',
  QUEUE = 'queue',
  MOVE_TO = 'moveTo',
  PUBLISH = 'publish',
  RESET = 'reset',
  VIEW_WORKER = 'viewWorker',
  TAGS = 'tags',
  SHOW_ALL_ITEMS = 'showAllItems'
};
