import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TableSortOrderEnum} from '@common/shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-projects-header',
  templateUrl: './projects-header.component.html',
  styleUrls: ['./projects-header.component.scss']
})
export class ProjectsHeaderComponent {
  @Input() searchQuery: string;
  @Input() sortOrder: TableSortOrderEnum;
  @Input() tags: string[];
  @Input() enableTagsFilter: boolean = false;

  @Input() set sortByField(sortByField: string) {
    this.sortByTitle = sortByField.includes('name') ? 'NAME' : 'RECENT';
  }

  @Output() orderByChanged = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();
  @ViewChild('menu') vcDropDownMenu;
  public sortByTitle: string;
}


