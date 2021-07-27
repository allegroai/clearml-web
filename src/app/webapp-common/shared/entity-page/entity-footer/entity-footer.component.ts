import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {ItemFooterModel} from '../footer-items/footer-items.models';
import {BaseContextMenuComponent} from '@common/shared/components/base-context-menu/base-context-menu.component';
import {Store} from '@ngrx/store';
import { ICONS } from '@common/constants';
import {trackByIndex} from '@common/shared/utils/forms-track-by';

@Component({
  selector   : 'sm-entity-footer',
  templateUrl: './entity-footer.component.html',
  styleUrls  : ['./entity-footer.component.scss']
})
export class EntityFooterComponent extends BaseContextMenuComponent {

  @Input() entitiesType: EntityTypeEnum;
  @Input() footerItems: ItemFooterModel[] = [];
  @Output() onFooterItemClick = new EventEmitter<{item: ItemFooterModel; emitValue: any}>();
  @Output() tagSelected = new EventEmitter();

  ICONS = ICONS;
  trackBy = trackByIndex;
  constructor( store: Store<any>,
               eRef: ElementRef) {
    super(store, eRef);
  }

}
