import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {MenuItems} from '../items.utils';

export class HasReadOnlyFooterItem<T = any> extends ItemFooterModel {
  emit = true;
  icon = ICONS.ALERT as Partial<IconNames>;
  description = `Selected read-only items cannot be modified`;
  wrapperClass = 'has-example-item';

  constructor(state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map( ({selectionHasExample}) => {
        return {
          preventCurrentItem: !selectionHasExample,
          title: `Selected read-only items cannot be modified`
        };
      })
    );
  }
}
