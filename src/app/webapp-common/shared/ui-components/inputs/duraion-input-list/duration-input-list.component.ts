import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef, EventEmitter,
  forwardRef,
  Input, OnChanges,
  OnInit, Output, QueryList, SimpleChanges,
  ViewChildren
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {DurationInputBase} from '../duration-input/duration-input.base';
import {isUndefined} from 'lodash/fp';

export type DURATION_INPUT_TYPE = 'hours' | 'seconds' | 'ms' | 'days' | 'minutes';

export interface DurationInputInterface  {
  type: DURATION_INPUT_TYPE;
  placeholder?: string;
  maxLength?: number;
}
const maxLengthMapper = {
  ms: 3,
  seconds: 2,
  hours: 2,
  minutes: 2,
  days: 3
};

export class DurationInput implements DurationInputInterface {
  placeholder: string;
  maxLength: number;
  constructor(public type: DURATION_INPUT_TYPE, placeholder?: string, maxLength?: number) {
    this.maxLength = maxLength ?? maxLengthMapper[type];
    this.placeholder = placeholder ?? '0'.padStart(this.maxLength, '0');
  }
}

export function durationInputFactory(values: Array<DURATION_INPUT_TYPE | DurationInput | DurationInputInterface>): DurationInput[] {

  if (!values && values.length === 0) { return null; }

  // the class it self
  if (values[0] instanceof DurationInput) {
    return values as DurationInput[];
  }

  // strings = ['ms', 'minutes', 'days']
  if (isUndefined((values[0] as DurationInputInterface).type)) {
    return (values as unknown as Array<DURATION_INPUT_TYPE>).map( (value) => new DurationInput(value) );
  }

  // an object {type: 'ms'}
  if (!isUndefined((values[0] as DurationInputInterface).type)) {
    return (values as unknown as Array<DurationInputInterface>).map( value => new DurationInput(value.type, value.placeholder, value.maxLength));
  }

  return null;
}

@Component({
  selector: 'sm-duration-input-list',
  templateUrl: './duration-input-list.component.html',
  styleUrls: ['./duration-input-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationInputListComponent),
      multi: true
    }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DurationInputListComponent extends DurationInputBase implements OnInit, AfterViewInit, OnChanges {
  @ViewChildren('inputRef') private elReference: QueryList<ElementRef>;

  @Input() set inputs(inputs: Array<DURATION_INPUT_TYPE | DurationInput | DurationInputInterface> ) {
    this.data = durationInputFactory(inputs);
    this.data.forEach( input => this.hasTimes[input.type] = true)
  }
  @Input() hasResetIcon = false;
  @Input() durationValue;  // this value is updated by programmatic changes if( ngModelValue !== undefined && this.ngModelValue !== ngModelValue){

  @Output() onResetIcon = new EventEmitter<null>();
  data: Array<DurationInput>;


  trackBy(index, item) {
    return index;
  }
  constructor(eRef: ElementRef, cdr: ChangeDetectorRef) {
    super(eRef, cdr);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.durationValue) {
      this.setValues(changes.durationValue.currentValue)
    }
  }

  setNextInputFocus(index: number) {
    return [...this.elReference][index + 1]?.nativeElement.focus();
  }

  setPreviousInputFocus(index: number) {

    return [...this.elReference][index - 1]?.nativeElement.focus();
  }

  setValue(value: string, input: DURATION_INPUT_TYPE) {
    this[input] = value;
  }

  private setValues(val) {
    if (val === null) {
      this.msToHMSMS(0);
      this.ngModelValue = 0;
      this.val = val;
      this.cdr?.detectChanges();
      return;
    }

    if (typeof val === 'object') { return;}

    if (val !== undefined && val !== this.val && val !== '0') {
      val = `${val || 0}`;
      const _val = +val * this.returnFactor;
      this.onEditing.emit(false);
      this.ngModelValue = val;
      this.val = val;

      // calc the ms,seconds,min with the value * factor
      this.msToHMSMS(_val);
      this.cdr?.detectChanges();
    }
  }
}

