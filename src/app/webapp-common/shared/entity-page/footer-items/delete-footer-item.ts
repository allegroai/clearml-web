import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {MenuItems} from '../items.utils';

export class DeleteFooterItem extends ItemFooterModel {
  id = MenuItems.delete;
  emit = true;
  icon = ICONS.REMOVE as Partial<IconNames>;
  disableDescription = 'Delete';

  constructor() {
    super();
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    return {
      preventCurrentItem: !state.selectionAllIsArchive,
      disable: state.data[this.id]?.disable,
      description: this.menuItemText.transform(state.data[MenuItems.delete]?.available , 'Delete'),
    };
  }
}
