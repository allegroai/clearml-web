import {GenericFooterItem} from './generic-footer-item';
import {IFooterState} from './footer-items.models';
import {IconNames} from '../../../constants';

export class DividerFooterItem extends GenericFooterItem {
  constructor() {
    super({className: 'divider'});
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    return {};
  }
}
