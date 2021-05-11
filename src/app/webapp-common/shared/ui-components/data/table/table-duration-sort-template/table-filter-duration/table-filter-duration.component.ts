import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DurationParameters, TableDurationSortBase} from '../table-duration-sort.base';
import {isNil} from 'lodash/fp';

@Component({
  selector: 'sm-table-filter-duration',
  templateUrl: './table-filter-duration.component.html',
  styleUrls: ['./table-filter-duration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TableFilterDurationComponent extends TableDurationSortBase implements OnInit {

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
