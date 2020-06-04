import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';

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

export class TableDiffComponent implements OnInit {
  @Input() keyTitle: string;
  @Input() valueTitle: string;
  @Input() keyValueArray: Array<IKeyValue>;
  @Input() isOrigin = false;
  @Input() sortConfig: ITableDiffSortBy;

  @Output() sortByChanged = new EventEmitter<ITableDiffSortBy>();
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor() {
  }

  ngOnInit() {
  }

  sortByClicked(sortBy) {
    this.sortByChanged.emit({ keyOrValue: sortBy, order: this.toggleSortOrder(this.sortConfig.order), keyValueArray: this.keyValueArray });
  }

  toggleSortOrder(order) {
    return order === 'asc' ? 'desc' : 'asc';
  }
}
