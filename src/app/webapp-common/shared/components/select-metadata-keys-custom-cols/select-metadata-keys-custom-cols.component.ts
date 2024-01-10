import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '../../ui-components/data/table/table.consts';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {NgForOf, NgIf} from '@angular/common';
import {SimpleFilterPipe} from '@common/shared/pipes/simple-filter.pipe';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-select-metadata-keys-custom-cols',
  templateUrl: './select-metadata-keys-custom-cols.component.html',
  styleUrls: ['./select-metadata-keys-custom-cols.component.scss'],
  standalone: true,
  imports: [
    SearchComponent,
    MenuItemComponent,
    NgForOf,
    SimpleFilterPipe,
    MatProgressSpinnerModule,
    NgIf,
    ClickStopPropagationDirective
  ]
})
export class SelectMetadataKeysCustomColsComponent {
  searchText: string;
  @Input() metadataKeys: string[];
  metadataColsIds: string[];

  @Input() set tableCols(cols: ISmCol[]) {
    this.metadataColsIds = cols.filter(col => col.type === 'metadata' || col.type==='hdmd').map(col => col.key);
  }

  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{ key: string; show: boolean }>();
  @Output() goBack = new EventEmitter();

  searchQ(search: string) {
    this.searchText = search;
  }

}
