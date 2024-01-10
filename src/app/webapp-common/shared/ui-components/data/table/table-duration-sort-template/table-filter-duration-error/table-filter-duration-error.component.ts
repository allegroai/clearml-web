import {Component, Input} from '@angular/core';

@Component({
  selector: 'sm-table-filter-duration-error',
  templateUrl: './table-filter-duration-error.component.html',
  styleUrls: ['./table-filter-duration-error.component.scss'],
  standalone: true,
})
export class TableFilterDurationErrorComponent {

  @Input() hasError: boolean;
  @Input() isFullWidth;
}
