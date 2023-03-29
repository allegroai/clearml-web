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

export const downloadObjectAsJson = (exportObj, exportName) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.href= dataStr;
  downloadAnchorNode.download=  exportName + '.json';
  downloadAnchorNode.click();
};

export const encodeHyperParameter = (path: string) => {
  const [prefix, section, ...rest] = path.split('.');
  const param = rest.slice(0, -1);
  return [prefix, section, rest.length > 0 ? param.join('%2E') : null, 'value'].filter(val => val !== null).join('.');
};
