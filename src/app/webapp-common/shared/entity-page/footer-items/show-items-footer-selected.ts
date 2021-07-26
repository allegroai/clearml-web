import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {Observable} from 'rxjs/internal/Observable';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {ItemFooterModel} from './footer-items.models';
import {MenuItems} from "../items.utils";

export class ShowItemsFooterSelected extends ItemFooterModel {
  id = MenuItems.showAllItems;
  emit = true;
  class = 'show-all';
  constructor(public entitiesType: EntityTypeEnum, private showAllSelectedIsActive$, private selectedExperiments$: Observable<Array<any>>) {
    super();
    this.state$ = combineLatest(
      [
        showAllSelectedIsActive$,
        selectedExperiments$.pipe(map(res => res.length))
      ]
    ).pipe(
      map( ([showAllSelectedIsActive, numberOfSelectedEntities]) =>  ({
        title: 'SHOW ' + (showAllSelectedIsActive? 'ALL ' + entitiesType?.toUpperCase() : (numberOfSelectedEntities + ' ' + entitiesType?.toUpperCase() + ' SELECTED') ),
        emitValue: showAllSelectedIsActive
      }))
    );
  }
}
