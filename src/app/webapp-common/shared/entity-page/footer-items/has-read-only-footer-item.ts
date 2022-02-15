import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';

export class HasReadOnlyFooterItem extends ItemFooterModel {
  emit = true;
  icon = ICONS.ALERT as Partial<IconNames>;
  description = `Selected read-only items cannot be modified`;
  wrapperClass = 'has-example-item';

  constructor() {
    super();
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    return {
      preventCurrentItem: !state.selectionHasExample,
      title: `Selected read-only items cannot be modified`
    };
  }
}
