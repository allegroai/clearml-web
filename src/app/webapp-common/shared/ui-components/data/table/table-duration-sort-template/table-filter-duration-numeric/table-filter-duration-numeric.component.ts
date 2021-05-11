import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {IDurationThan, DurationParameters, TableDurationSortBase} from '../table-duration-sort.base';
import {FormControl, FormGroup} from '@angular/forms';
import {distinctUntilChanged, debounceTime, map} from 'rxjs/operators';
import {merge, Subscription} from 'rxjs';
import {isNil} from 'lodash/fp';

function getDurationValue(data: IDurationThan) {
  return isNil(data.value) || !data.checked ? '' : data.value;
}


@Component({
  selector: 'sm-table-filter-duration-numeric',
  templateUrl: './table-filter-duration-numeric.component.html',
  styleUrls: ['./table-filter-duration-numeric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TableFilterDurationNumericComponent extends TableDurationSortBase implements OnInit, OnDestroy {
  iterationsForm = new FormGroup( {
    greaterThan: new FormControl(''),
    lessThan: new FormControl('')
  });
  private subscription: Subscription;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    const greaterThan$ = this.iterationsForm.get('greaterThan').valueChanges.pipe( map (value => ({name: 'greaterThan', value})));
    const lessThan$ = this.iterationsForm.get('lessThan').valueChanges.pipe( map (value => ({name: 'lessThan', value})));

    this.subscription = merge(greaterThan$, lessThan$ )
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe( ({value, name}: {value: number; name: DurationParameters}) => {
        if (this[name].checked !== !!value) {
          this.setCheckBox(!!value, name, false);
        }
        this.timeStampChanged(value, name);
      });
  }

  parseServerDataFunction(data): number {
    return +data;
  }
  prepareDataToServerFunction(data): string | number | null {
    return isNil(data) || data === '' ? null : +data ;
  }
  _updateValue(): void {
    const greaterThan = getDurationValue(this.greaterThan);
    const lessThan = getDurationValue(this.lessThan);
    this.iterationsForm.get('greaterThan').setValue(greaterThan);
    this.iterationsForm.get('lessThan').setValue(lessThan);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
