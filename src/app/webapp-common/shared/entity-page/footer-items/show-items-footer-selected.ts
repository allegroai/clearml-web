import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {IFooterState, ItemFooterModel} from './footer-items.models';
import {MenuItems} from '../items.utils';

export class ShowItemsFooterSelected extends ItemFooterModel {
  id = MenuItems.showAllItems;
  emit = true;
  class = 'show-all';


  constructor(public entitiesType: EntityTypeEnum) {
    super();
  }

  getItemState(state: IFooterState<any>) {
    return {
      title: state.showAllSelectedIsActive ?
        `SHOW ALL ${this.entitiesType.toUpperCase()}S` :
        `SHOW ${state.selected.length} SELECTED ${this.entitiesType.toUpperCase()}S`,
      emitValue: state.showAllSelectedIsActive,
      preventCurrentItem: false
    };
  }
}
