import {Component, input } from '@angular/core';

@Component({
  selector: 'sm-table-filter-duration-error',
  templateUrl: './table-filter-duration-error.component.html',
  styleUrls: ['./table-filter-duration-error.component.scss'],
  standalone: true,
})
export class TableFilterDurationErrorComponent {

  hasError = input<boolean>();
  fullWidth = input<boolean>();
}
