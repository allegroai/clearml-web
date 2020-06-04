import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TableSortOrderEnum} from '../../../shared/ui-components/data/table/table.consts';

@Component({
  selector   : 'sm-projects-header',
  templateUrl: './projects-header.component.html',
  styleUrls  : ['./projects-header.component.scss']
})
export class ProjectsHeaderComponent {
  @Input() hideCreateButton: boolean;
  @Input() searchQuery: string;
  @Input() sortOrder: TableSortOrderEnum;

  @Input() set sortByField(sortByField: string) {
    this.sortByTitle = sortByField.includes('name') ? 'NAME' : 'RECENT';
  }

  @Output() orderByChanged       = new EventEmitter<string>();
  @Output() searchChanged        = new EventEmitter<string>();
  @Output() createProjectClicked = new EventEmitter<void>();
  @ViewChild('menu') vcDropDownMenu;
  public sortByTitle: string;

  constructor() {
  }
}


