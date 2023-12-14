import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DurationParameters, TableDurationSortBaseComponent} from '../table-duration-sort-base.component';
import {isNil} from 'lodash-es';

@Component({
  selector: 'sm-table-filter-duration',
  templateUrl: './table-filter-duration.component.html',
  styleUrls: ['./table-filter-duration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TableFilterDurationComponent extends TableDurationSortBaseComponent implements OnInit {

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
  }

  _updateValue(): void {
  }

  parseServerDataFunction(data): number {
    return +data;
  }

  prepareDataToServerFunction(data): number {
    return isNil(data) || data === '' ? null : +data ;
  }

  timeStampChanged(value: number, name: DurationParameters) {
    if (this[name].checked !== !!value) {
      this.setCheckBox(!!value, name, false);
    }
    super.timeStampChanged(value, name);
  }

}
