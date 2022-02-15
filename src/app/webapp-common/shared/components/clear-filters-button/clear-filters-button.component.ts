import {ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FilterMetadata} from 'primeng/api/filtermetadata';

@Component({
  selector: 'sm-clear-filters-button',
  templateUrl: `./clear-filters-button.component.html`,
  styleUrls: ['./clear-filters-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClearFiltersButtonComponent implements OnInit {

  @Input() set tableFilters(tableFilters: { [s: string]: FilterMetadata }) {
    this.isTableFiltered = Object.values(tableFilters).some(({value}) => value.length > 0);
  };
  @Output() clearTableFilters = new EventEmitter<null>();

  public isTableFiltered: boolean;

  constructor() { }

  ngOnInit(): void {}

}
