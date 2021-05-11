import {GenericFooterItem} from './generic-footer-item';
import {IconNames, ICONS} from '../../../constants';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {MENU_ITEM_ID} from '../items.utils';

export class CompareFooterItem extends GenericFooterItem {
  id = MENU_ITEM_ID.COMPARE;
  icon = ICONS.COMPARE as Partial<IconNames>;
  class = 'compare';
  title = 'COMPARE';
  emit = true;
  constructor(public entitiesType?: EntityTypeEnum) {
    super();
  }
}
