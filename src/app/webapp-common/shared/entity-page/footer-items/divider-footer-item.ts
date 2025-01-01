import {GenericFooterItem} from './generic-footer-item';
import {ItemState} from './footer-items.models';

export class DividerFooterItem extends GenericFooterItem {
  override divider = true;

  override getItemState(): ItemState
  {
    return {};
  }
}
