import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {IFooterState, ItemFooterModel} from '../footer-items/footer-items.models';
import {BaseContextMenuComponent} from '@common/shared/components/base-context-menu/base-context-menu.component';
import {Store} from '@ngrx/store';
import {ICONS} from '@common/constants';
import {trackByIndex} from '@common/shared/utils/forms-track-by';

@Component({
  selector   : 'sm-entity-footer',
  templateUrl: './entity-footer.component.html',
  styleUrls  : ['./entity-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityFooterComponent  extends BaseContextMenuComponent {

  @Input() entitiesType: EntityTypeEnum;
  @Input() footerItems: ItemFooterModel[] = [];
  @Input() footerState: IFooterState<any>;
  @Output() footerItemClick = new EventEmitter<{item: ItemFooterModel; emitValue: any}>();
  @Output() tagSelected = new EventEmitter();

  icons = ICONS;
  trackBy = trackByIndex;
  constructor(store: Store<any>, eRef: ElementRef) {
    super(store, eRef);
  }

}
