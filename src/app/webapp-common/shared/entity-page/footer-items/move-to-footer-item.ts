import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {MenuItems} from '../items.utils';

export class MoveToFooterItem extends ItemFooterModel {
  id = MenuItems.moveTo;
  emit = true;
  icon = ICONS.MOVE_TO as Partial<IconNames>;
  disableDescription = 'Move To';
  constructor() {
    super();
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    return {
      disable: state.data[this.id]?.disable,
      description: this.menuItemText.transform(state.data[MenuItems.moveTo]?.available, 'Move To') ,
      // disableDescription: selectionIsOnlyExamples ? 'Move To' : this.disableDescription
    };
  }
}
