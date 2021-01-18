import {TableModel} from './shared/models.model';
import {isExample} from '../shared/utils/shared-utils';

export function getSysTags(model: TableModel) {
  return (model?.system_tags?.filter(tag => (tag !== 'archived') && (tag !== 'shared')) || []).concat(isExample(model) ? 'example' : []);
}
