import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {MenuItems} from '../items.utils';

export class RetryFooterItem extends ItemFooterModel {

  constructor() {
    super();
    this.id = MenuItems.retry;
    this.emit = true;
    this.icon = ICONS.RETRY as Partial<IconNames>;
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    const retry = state.data[this.id];

    return {
      disable: retry?.disable,
      preventCurrentItem: state.selectionAllIsArchive,
      description: this.menuItemText.transform(retry?.available, 'Retry'),
      disableDescription: state.selectionIsOnlyExamples ? 'Retry' : `You can only retry experiments with ‘Failed' status`

    };
  }
}
