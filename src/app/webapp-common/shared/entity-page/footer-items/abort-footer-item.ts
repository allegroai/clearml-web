import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {MenuItems, selectionDisabledAbort} from '../items.utils';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

export class AbortFooterItem extends ItemFooterModel {
  id = MenuItems.abort;
  emit = true;
  icon = ICONS.STOPPED as Partial<IconNames>;

  constructor(public entitiesType: EntityTypeEnum) {
    super();
  }
  getItemState(state: IFooterState<any>) {
    const {available, disable} = selectionDisabledAbort(state.selected);
    return {
      disable,
      description: `Abort (${available} items)`,
      disableDescription: state.selectionIsOnlyExamples ? 'Abort' : `You can only abort ${this.entitiesType}s with ‘Running’ status`
    };
  }
}
