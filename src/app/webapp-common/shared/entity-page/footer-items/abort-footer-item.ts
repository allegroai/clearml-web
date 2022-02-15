import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {MenuItems, selectionDisabledAbort} from '../items.utils';

export class AbortFooterItem extends ItemFooterModel {
  id = MenuItems.abort;
  emit = true;
  icon = ICONS.STOPPED as Partial<IconNames>;

  constructor() {
    super();
  }
  getItemState(state: IFooterState<any>) {
    const {available, disable} = selectionDisabledAbort(state.selected);
    return {
      disable,
      description: `Abort (${available} items)`,
      disableDescription: state.selectionIsOnlyExamples ? 'Abort' : `You can only abort experiments with ‘Running’ status`
    };
  }
}
