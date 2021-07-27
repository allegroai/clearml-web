import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {Observable} from 'rxjs/internal/Observable';
import {map} from 'rxjs/operators';
import {MenuItems} from '../items.utils';

export class MoveToFooterItem<T = any> extends ItemFooterModel {
  id = MenuItems.moveTo;
  emit = true;
  icon = ICONS.MOVE_TO as Partial<IconNames>;
  disableDescription = 'Move To';
  constructor(state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({data, selectionIsOnlyExamples, selected}) => {
        return {
          disable: data[this.id].disable,
          description: this.menuItemText.transform(data[MenuItems.moveTo].available, 'Move To') ,
          // disableDescription: selectionIsOnlyExamples ? 'Move To' : this.disableDescription
        };
      }));
  }
}
