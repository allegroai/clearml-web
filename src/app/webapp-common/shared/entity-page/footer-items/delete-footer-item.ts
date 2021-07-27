import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {MenuItems, selectionDisabledDelete} from '../items.utils';

export class DeleteFooterItem<T = any> extends ItemFooterModel {
  id = MenuItems.delete;
  emit = true;
  icon = ICONS.REMOVE as Partial<IconNames>;
  disableDescription = 'Delete';

  constructor(state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({data, selectionAllIsArchive}) => ({
          preventCurrentItem: !selectionAllIsArchive,
          disable: data[this.id].disable,
          description: this.menuItemText.transform(data[MenuItems.delete].available , 'Delete'),
        }))
    );
  }
}
