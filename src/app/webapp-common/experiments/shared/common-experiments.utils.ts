import {DIGITS_AFTER_DECIMAL} from '~/features/experiments/shared/experiments.const';
import {ITableExperiment} from '@common/experiments/shared/common-experiment-model.model';

export const convertStopToComplete = (tasks) => tasks.map(task => {
  if (task.status === 'closed') {
    task.status = 'completed';
  }
  return task;
});

export const filterArchivedExperiments = (experiments, showArchived): ITableExperiment[] => {
  if (showArchived) {
    return experiments.filter(ex => ex?.system_tags?.includes('archived'));
  } else {
    return experiments.filter(ex => !(ex?.system_tags?.includes('archived')));
  }
};

export const getRoundedNumber = (value: number) => Math.round(value * Math.pow(10, DIGITS_AFTER_DECIMAL)) / Math.pow(10, DIGITS_AFTER_DECIMAL);

export const convertDurationFilter = (filter: string[]): string | string[] => {
  let newFilter;
  if (filter[0]) {
    newFilter = `>=${filter[0]}`;
  }
  if (filter[1]) {
    newFilter = newFilter ? [newFilter, `<=${filter[1]}`] : `<=${filter[1]}`;
  }
  return newFilter;
};
