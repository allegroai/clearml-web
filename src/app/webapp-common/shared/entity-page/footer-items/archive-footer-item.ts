import {filter, map} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {IconNames, ICONS} from '../../../constants';
import {ItemFooterModel, IFooterState} from './footer-items.models';
import {MenuItems} from '../items.utils';

export class ArchiveFooterItem<T = any> extends ItemFooterModel {
  id = MenuItems.archive;

  constructor(public entitiesType: EntityTypeEnum, state$: Observable<IFooterState<T>>) {
    super();
    this.state$ = state$.pipe(
      map(({selectionAllIsArchive, data, selectionIsOnlyExamples}) => {
        const archive = data[this.id];
        const icon = (selectionAllIsArchive ? ICONS.RESTORE : ICONS.ARCHIVE) as Partial<IconNames>;
        const name = icon === ICONS.RESTORE ? 'Restore' : 'Archive';

        return {
          description: this.menuItemText.transform(archive.available, icon === ICONS.RESTORE ? 'Restore from Archive' : 'Archive'),
          icon,
          disable: archive.disable,
          disableDescription: selectionIsOnlyExamples ? name : `Only ${this.entitiesType} owned can be ${name}`
        };
      })
    );
  }
}
