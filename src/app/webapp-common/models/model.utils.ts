import {ITableModel} from './shared/models.model';
import {isExample} from '../shared/utils/shared-utils';

export function getSysTags(model: ITableModel) {
  return (model?.system_tags.filter(tag => tag !== 'archived') || []).concat(isExample(model) ? 'example' : []);
}
