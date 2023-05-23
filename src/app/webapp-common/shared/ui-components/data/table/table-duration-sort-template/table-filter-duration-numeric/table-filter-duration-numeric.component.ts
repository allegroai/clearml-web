import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  IDurationThan,
  ImmediateErrorStateMatcher,
  TableDurationSortBaseComponent
} from '../table-duration-sort-base.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {distinctUntilChanged, debounceTime, filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {isNil} from 'lodash-es';

const getDurationValue = (value: IDurationThan) => value.checked ? `${value.value}` : '';


@Component({
  selector: 'sm-table-filter-duration-numeric',
  templateUrl: './table-filter-duration-numeric.component.html',
  styleUrls: ['./table-filter-duration-numeric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TableFilterDurationNumericComponent extends TableDurationSortBaseComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  immediate = new ImmediateErrorStateMatcher();
  numericPattern = '(|-?(0\\.|\\.|)\\d*)';

  iterationsForm = new FormGroup( {
    greaterThan: new FormControl<string>('', [Validators.pattern(this.numericPattern)]),
    lessThan: new FormControl<string>('', [Validators.pattern(this.numericPattern)])
  });

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    this.iterationsForm.valueChanges
      .pipe(
        debounceTime(200),
        filter(() => this.iterationsForm.valid),
        distinctUntilChanged()
      )
      .subscribe( ({greaterThan, lessThan}) => {
        !!greaterThan != this.greaterThan.checked && this.setCheckBox(!this.greaterThan.checked, 'greaterThan', false);
        this.timeStampChanged(!!greaterThan ? parseInt(greaterThan, 10) : greaterThan, 'greaterThan');
        !!lessThan != this.lessThan.checked && this.setCheckBox(!this.lessThan.checked, 'lessThan', false);
        this.timeStampChanged(!!lessThan ? parseInt(lessThan, 10) : lessThan, 'lessThan');
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
