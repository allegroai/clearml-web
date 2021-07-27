import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {map} from 'rxjs/operators';
import {TaskStatusEnum} from '../../../../business-logic/model/tasks/taskStatusEnum';
import {Observable} from 'rxjs/internal/Observable';
import {MenuItems} from '../items.utils';
import {EntityTypeEnum} from "../../../../shared/constants/non-common-consts";

export class ResetFooterItem<T extends {status: TaskStatusEnum}> extends ItemFooterModel {
  id = MenuItems.reset;
  emit = true;
  icon = ICONS.RESET as Partial<IconNames>;

  constructor(public entitiesType: EntityTypeEnum, state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({data, selected, selectionIsOnlyExamples}) => {
        return {
          disable: data[this.id].disable,
          description: this.menuItemText.transform(data[this.id].available, 'Reset'),
          disableDescription: selectionIsOnlyExamples ? 'Reset' : `You can only reset non-draft, non-published ${entitiesType}s`
        };
      }
    ));
  }
}
