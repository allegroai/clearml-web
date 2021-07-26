import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {MenuItems} from '../items.utils';

export class EnqueueFooterItem<T = any> extends ItemFooterModel {
  id = MenuItems.enqueue;
  emit = true;
  icon = ICONS.ENQUEUE as Partial<IconNames>;

  constructor(state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({data, selectionIsOnlyExamples, selectionAllIsArchive}) => {
        const enqueue = data[this.id];

        return {
          disable: enqueue.disable,
          preventCurrentItem: selectionAllIsArchive,
          description: this.menuItemText.transform(enqueue.available, 'Enqueue'),
          disableDescription: selectionIsOnlyExamples ? 'Enqueue' : `You can only enqueue experiments with ‘Draft’/'Aborted' status`

        };
      })
    );
  }
}
