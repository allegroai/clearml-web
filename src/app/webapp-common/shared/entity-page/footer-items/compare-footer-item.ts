import {IconNames, ICONS} from '../../../constants';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {MenuItems} from '../items.utils';
import { ItemFooterModel} from './footer-items.models';
export const compareLimitations = 100;
export class CompareFooterItem extends ItemFooterModel  {

  constructor(public entitiesType: EntityTypeEnum) {
    super();
    this.id = MenuItems.compare;
    this.icon = ICONS.COMPARE as Partial<IconNames>;
    this.class = 'compare';
    this.title = 'COMPARE';
    this.emit = true;
    this.disableDescription = `${compareLimitations} or fewer ${this.entitiesType}s can be compared`;
  }
  getItemState(state): any {
    return {
      disable: state.selected.length > compareLimitations || state.selected?.length <2,
    };

  }
}
