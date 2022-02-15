import {IconNames, ICONS} from '../../../constants';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {MenuItems} from '../items.utils';
import { ItemFooterModel} from './footer-items.models';
export const compareLimitations = 10;
export class CompareFooterItem extends ItemFooterModel  {
  id = MenuItems.compare;
  icon = ICONS.COMPARE as Partial<IconNames>;
  class = 'compare';
  title = 'COMPARE';
  emit = true;
  disableDescription = `${compareLimitations} or fewer ${this.entitiesType}s can be compared`;

  constructor(public entitiesType: EntityTypeEnum) {
    super();
  }
  getItemState(state): any {
    return {
      disable: state.selected.length > 10,
    };

  }
}
