import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol, TABLE_SORT_ORDER} from '../../ui-components/data/table/table.consts';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'sm-custom-columns-list',
  templateUrl: './custom-columns-list.component.html',
  styleUrls: ['./custom-columns-list.component.scss'],
  imports: [
    MenuItemComponent,
    MatProgressSpinnerModule,
],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomColumnsListComponent {
  @Input() tableCols: ISmCol[];
  @Input() isLoading: boolean;
  @Input() selectable: boolean = true;
  @Input() menuTitle = 'CUSTOMIZE COLUMNS';
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();

  protected readonly TABLE_SORT_ORDER = TABLE_SORT_ORDER;
}
