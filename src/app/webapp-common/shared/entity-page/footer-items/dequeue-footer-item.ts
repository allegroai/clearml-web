import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {MenuItems} from '../items.utils';

export class DequeueFooterItem<T = any> extends ItemFooterModel {
  id = MenuItems.dequeue;
  emit = true;
  icon = ICONS.DEQUEUE as Partial<IconNames>;

  constructor(state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({data, selected, selectionIsOnlyExamples}) => {
        const dequeue = data[this.id];
        return {
          preventCurrentItem: dequeue.disable,
          disable:  dequeue.disable,
          description: this.menuItemText.transform(dequeue.available, 'Dequeue'),
          disableDescription: selectionIsOnlyExamples ? 'Dequeue' : `You can only dequeue experiments with ‘Pending’ status`
        };
      })
    );
  }
}
