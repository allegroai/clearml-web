import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sm-table-filter-duration-error',
  templateUrl: './table-filter-duration-error.component.html',
  styleUrls: ['./table-filter-duration-error.component.scss']
})
export class TableFilterDurationErrorComponent implements OnInit {

  @Input() hasError: boolean;
  @Input() isFullWidth;

  constructor() { }

  ngOnInit(): void {
  }

}
