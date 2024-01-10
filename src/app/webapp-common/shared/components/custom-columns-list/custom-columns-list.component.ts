import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '../../ui-components/data/table/table.consts';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'sm-custom-columns-list',
  templateUrl: './custom-columns-list.component.html',
  styleUrls: ['./custom-columns-list.component.scss'],
  imports: [
    MenuItemComponent,
    MatProgressSpinnerModule,
    NgClass,
    NgForOf
  ],
  standalone: true
})
export class CustomColumnsListComponent {
  @Input() tableCols: ISmCol[];
  @Input() isLoading;
  @Input() menuTitle = 'CUSTOMIZE COLUMNS';
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();

  trackById = (index: number, col: ISmCol) => col.id;
}
