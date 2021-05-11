import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DurationParameters, TableDurationSortBase} from '../table-duration-sort.base';
import {TIME_IN_MILLI} from '../../../../../utils/time-util';
import {MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {isNil} from 'lodash/fp';
import {hasValue} from '../../../../../utils/helpers.util';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

type privateParameters = '_lessThan' | '_greaterThan';
const fromPrivateToGlobal = (privateParameters: privateParameters) => privateParameters.replace('_', '') as DurationParameters;
const fromGlobalToPrivate = (parameter: DurationParameters) => '_' + parameter.replace('_', '') as privateParameters;
const addUserTimezoneToIsoDate = (data) => {
  const myDate = new Date(data);
  const offset = myDate.getTimezoneOffset() * TIME_IN_MILLI.ONE_MIN;

  const withOffset = myDate.getTime();
  const withoutOffset = withOffset - offset;
  return withoutOffset;
}
@Component({
  selector: 'sm-table-filter-duration-date-time',
  templateUrl: './table-filter-duration-date-time.component.html',
  styleUrls: ['./table-filter-duration-date-time.component.scss'],
  providers:[
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }

  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterDurationDateTimeComponent  extends TableDurationSortBase implements OnInit {
  _selectedDate: Date;
  _selectedTimeInSeconds: number;

  _lessThan = {
    date: undefined,
    time: 0
  };
  _greaterThan = {
    date: undefined,
    time: 0
  };
  isFakeNowCheckbox = false;
  MINIMUM_TIME_DISPLAY = 0.001
  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
  }

  get hasGreaterThanValue() {
    return this._greaterThan.date || this._greaterThan.time;
  }
  get hasLessThanValue() {
    return this.isFakeNowCheckbox || this._lessThan.date || this._lessThan.time;
  }
  parseServerDataFunction(data): number {
    if (data) {
      return addUserTimezoneToIsoDate(data)
    }
    return +new Date(data || 0);
  }

  prepareDataToServerFunction(data): string | null {
    return  isNil(data) || data === '' || isNaN(data) ? null : new Date(data).toISOString().split('.')[0];
  }


  _updateValue() {
    const {lessThan: {value: lessThanValue}, greaterThan: {value: greaterThanValue}} = this;

    let lessThanDate, greaterThanDate;

    if (lessThanValue) {
      lessThanDate = mutedDateToNoHourMinutesSeconds(new Date(lessThanValue));
    }
    if (greaterThanValue) {
      greaterThanDate = mutedDateToNoHourMinutesSeconds(new Date(greaterThanValue));
    }
    const lessThanTime = lessThanValue || 0;
    const greaterThanTime = greaterThanValue || 0;

    this._lessThan = {time: getTimeInSecondsFromDate(lessThanTime), date: lessThanDate};
    this._greaterThan = {time: getTimeInSecondsFromDate(greaterThanTime), date: greaterThanDate};
  }

  /**
   * Handle the change in mat datepicker
   * @param value
   * @param valueName
   * @param emitValue
   */
  onDateHandler(value: Date, valueName: privateParameters, emitValue = true): void {
    this[valueName] = {...this[valueName], date: value};
    if (!hasValue(value)) {
      this[valueName] = {...this[valueName], time: null};
      this.setCheckBox(false, fromPrivateToGlobal(valueName));
    }else if (!hasValue(this[valueName].time) || this[valueName].time < this.MINIMUM_TIME_DISPLAY) {
      this.onTimeHandler(this.MINIMUM_TIME_DISPLAY, valueName, false);
    }
    emitValue && this.combineDateAndTimeAndEmitValue(valueName);
  }

  /**
   * Handle changed in the time component
   * @param value
   * @param valueName
   * @param emitValue
   */
  onTimeHandler(value: number, valueName: privateParameters, emitValue = true): void {
    this[valueName] = {...this[valueName], time: value};
    emitValue && this.combineDateAndTimeAndEmitValue(valueName);
  }

  combineDateAndTimeAndEmitValue(valueName: privateParameters): void {
    const {time: timeInSeconds, date} = this[valueName];

    const timeObject = new Date(+date + timeInSeconds * TIME_IN_MILLI.ONE_SEC);

    const parameterName = valueName.substr(1) as DurationParameters;
    const returnDateObject = date ? +timeObject : undefined;

    this.timeStampChanged(returnDateObject, parameterName);
  }

  onResetToDateInput() {
    this.isFakeNowCheckbox = false;
    this.onResetHandler('lessThan');
  }
  onResetHandler(paramName: DurationParameters): void {
    const privateParam = fromGlobalToPrivate(paramName);

    this.setCheckBox(false, paramName);
    this.onDateHandler(null, privateParam, false);
    this.onTimeHandler(0, privateParam);
  }

  onAutoFillCurrentTimeHandler(paramName: DurationParameters) {
    const privateParam = `_${paramName}` as privateParameters;

    let currentTime = new Date();

    const timeInSecondsFromDate = getTimeInSecondsFromDate(currentTime);

    this.onTimeHandler(timeInSecondsFromDate, privateParam as privateParameters, true);
    currentTime = mutedDateToNoHourMinutesSeconds(currentTime);

    this.onDateHandler(currentTime, privateParam);

    return true;
  }

  onFakeNowCheckbox() {
      this.isFakeNowCheckbox = true;
  }
}

/**
 * Remove Seconds, Minutes and Hours from Date object
 * @param date
 */
function mutedDateToNoHourMinutesSeconds(_date: Date | number) {
  const date = new Date(_date);
  date.setSeconds(0);
  date.setMinutes(0);
  date.setHours(0);
  return date;
}

/**
 * Get how many seconds in the Date object;
 * @example getTimeInSecondsFromDate(01-01-2021 00:01:00)  => 60 seconds
 * @param _date
 */
export function getTimeInSecondsFromDate(_date: number | Date): number {
  if (_date === 0) { return 0; }

  const date = new Date(_date);
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() * 60;
  const hours = date.getHours() * 60 * 60;
  return seconds + minutes + hours;
}
