import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {TaskStatusEnum} from '../../../../business-logic/model/tasks/taskStatusEnum';
import {MenuItems, selectionDisabledAbort} from '../items.utils';

export class AbortFooterItem<T extends {status: TaskStatusEnum}> extends ItemFooterModel {
  id = MenuItems.abort;
  emit = true;
  icon = ICONS.STOPPED as Partial<IconNames>;

  constructor(state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({selected, selectionIsOnlyExamples}) => {
        const {available, disable} = selectionDisabledAbort(selected);
        return {
          disable: disable,
          description: `Abort (${available} items)`,
          disableDescription: selectionIsOnlyExamples ? 'Abort' : `You can only abort experiments with ‘Running’ status`
        };
      })
    );
  }
}
