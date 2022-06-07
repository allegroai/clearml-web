import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef
} from '@angular/core';
import { trackByIndex } from '@common/shared/utils/forms-track-by';

export interface IKeyValue {
  key: string;
  value: number;
}


export interface ITableDiffSortBy {
  keyOrValue: 'key' | 'value';
  order: 'asc' | 'desc';
  keyValueArray: Array<IKeyValue>;
}

@Component({
  selector: 'al-table-diff',
  templateUrl: './table-diff.component.html',
  styleUrls: ['./table-diff.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableDiffComponent {
  @Input() keyTitle: string;
  @Input() valueTitle: string;
  @Input() keyValueArray: Array<IKeyValue>;
  @Input() isOrigin = false;
  @Input() sortConfig: ITableDiffSortBy;
  @Input() hoveredRow: string;

  @Output() rowHovered = new EventEmitter<string>();
  @Output() sortByChanged = new EventEmitter<ITableDiffSortBy>();
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  trackByIndex = trackByIndex;

  sortByClicked(sortBy) {
    this.sortByChanged.emit({ keyOrValue: sortBy, order: this.toggleSortOrder(this.sortConfig.order), keyValueArray: this.keyValueArray });
  }

  toggleSortOrder(order) {
    return order === 'asc' ? 'desc' : 'asc';
  }
}
