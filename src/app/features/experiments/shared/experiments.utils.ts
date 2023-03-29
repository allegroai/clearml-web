import {Model} from '../../../business-logic/model/models/model';
import {ISelectedExperiment} from './experiment-info.model';
import {isExample} from '../../../webapp-common/shared/utils/shared-utils';


export function areLabelsEqualss(modelLabels: Model['labels'], labels: Model['labels']) {
  return true;
}

export function isDevelopment(entity): boolean {
  return false;
}

export function getSystemTags(experiment: ISelectedExperiment) {
  const sysTags = [];
  if (isExample(experiment)) {
    sysTags.push('example');
  }
  return sysTags;
}
