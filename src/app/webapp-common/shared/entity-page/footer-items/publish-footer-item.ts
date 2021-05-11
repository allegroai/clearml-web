import {IFooterState, ItemFooterModel} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {Observable} from 'rxjs/internal/Observable';
import {map} from 'rxjs/operators';
import {MENU_ITEM_ID} from '../items.utils';
import {TaskStatusEnum} from '../../../../business-logic/model/tasks/taskStatusEnum';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';

export class PublishFooterItem<T extends { status: TaskStatusEnum }> extends ItemFooterModel {
  id = MENU_ITEM_ID.PUBLISH;
  emit = true;
  icon = ICONS.PUBLISHED as Partial<IconNames>;

  constructor(state$: Observable<IFooterState<T>>, entityType: EntityTypeEnum) {
    super();
    this.disableDescription = entityType === EntityTypeEnum.experiment ? this.disableDescription : ``;
    this.state$ = state$.pipe(
      map(({data, selectionIsOnlyExamples}) => ({
          disable: data[this.id].disable,
          description: this.menuItemText.transform(data[MENU_ITEM_ID.PUBLISH].available, 'Publish'),
          disableDescription: selectionIsOnlyExamples ? 'Publish' : `You can only publish ${entityType}s that have already been executed`
        })
      ));
  }
}
