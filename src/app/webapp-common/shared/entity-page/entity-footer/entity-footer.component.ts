import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {IFooterState, ItemFooterModel} from '../footer-items/footer-items.models';
import {BaseContextMenuComponent} from '@common/shared/components/base-context-menu/base-context-menu.component';
import {ICONS} from '@common/constants';
import {trackByIndex} from '@common/shared/utils/forms-track-by';
import {NgClass, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {CompareFooterComponent} from '@common/shared/ui-components/panel/compare-footer/compare-footer.component';
import {MatMenuModule} from '@angular/material/menu';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';

@Component({
  selector: 'sm-entity-footer',
  templateUrl: './entity-footer.component.html',
  styleUrls: ['./entity-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgClass,
    TooltipDirective,
    CompareFooterComponent,
    MatMenuModule,
    TagsMenuComponent,
    NgForOf
  ],
  standalone: true
})
export class EntityFooterComponent  extends BaseContextMenuComponent {

  @Input() entitiesType: EntityTypeEnum;
  @Input() footerItems: ItemFooterModel[] = [];
  @Input() footerState: IFooterState<any>;
  @Output() footerItemClick = new EventEmitter<{item: ItemFooterModel; emitValue: any}>();
  @Output() tagSelected = new EventEmitter();

  icons = ICONS;
  trackBy = trackByIndex;

}
