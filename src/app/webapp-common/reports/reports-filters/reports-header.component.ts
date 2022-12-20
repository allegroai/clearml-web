import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableSortOrderEnum} from '@common/shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-reports-header',
  templateUrl: './reports-header.component.html',
  styleUrls: ['./reports-header.component.scss']
})
export class ReportsHeaderComponent {

  public queryString: string = null;
  public sortByTitle: string;

  @Input() archive: boolean;
  @Input() disableCreate = false;
  @Input() disableSort = false;
  @Input() activeSearch: boolean;
  @Input() sortOrder: TableSortOrderEnum;
  @Input() allTags: string[] = [];

  @Input() set sortByField(sortByField: string) {
    this.sortByTitle = sortByField.includes('name') ? 'NAME' : 'RECENT';
  }

  @Output() reportsFilterChanged = new EventEmitter<string>();
  @Output() orderByChanged = new EventEmitter<string>();
  @Output() createReportClicked = new EventEmitter<string>();
  @Output() archiveToggled = new EventEmitter<boolean>();

  filterReports(queryString) {
    this.reportsFilterChanged.emit(queryString);
    this.queryString = queryString;
  }
}
