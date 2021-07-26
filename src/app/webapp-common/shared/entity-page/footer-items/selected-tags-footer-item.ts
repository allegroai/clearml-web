import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {IFooterState, ItemFooterModel} from './footer-items.models';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, tap} from 'rxjs/operators';
import {MenuItems, selectionTags} from '../items.utils';

export class SelectedTagsFooterItem extends ItemFooterModel {
  id = MenuItems.tags;
  isTag = true;
  disableDescription = 'Tags'

  constructor(
    public entitiesType: EntityTypeEnum,
    state$: Observable<IFooterState<any>>,
    public companyTags$:   Observable<string[]>,
    public projectTags$: Observable<string[]>,
    public tagsFilterByProject$: Observable<boolean>
  ) {
    super();
    let _selected;
    this.state$ = state$.pipe(
      map(({selected, selectionAllHasExample, data})  => {
        const tags = data[this.id];
        return {
          disable: selectionAllHasExample,
          description: this.menuItemText.transform(tags.selectedFiltered.length, 'Add Tag'),
          disableDescription: 'Tags',
          emitValue: tags.selectedFiltered
        };
      })
    )
    this.tags$ = state$.pipe(
      tap( ({selected}) => _selected =  selected ),
      distinctUntilChanged(({selected}) => selected === _selected),
      map( ({selected}) => selectionTags(selected)),
      shareReplay()
    );
  }
}
