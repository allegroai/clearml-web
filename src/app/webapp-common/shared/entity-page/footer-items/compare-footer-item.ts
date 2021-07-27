import {GenericFooterItem} from './generic-footer-item';
import {IconNames, ICONS} from '../../../constants';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {MenuItems} from '../items.utils';

export class CompareFooterItem extends GenericFooterItem {
  id = MenuItems.compare;
  icon = ICONS.COMPARE as Partial<IconNames>;
  class = 'compare';
  title = 'COMPARE';
  emit = true;
  constructor(public entitiesType?: EntityTypeEnum) {
    super();
  }
}
