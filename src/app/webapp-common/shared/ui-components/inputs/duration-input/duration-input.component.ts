import {Component, ElementRef, forwardRef, HostListener} from '@angular/core';
import {TemplateFormSectionBase} from '../../template-forms-ui/templateFormSectionBase';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'sm-duration-input',
  templateUrl: './duration-input.component.html',
  styleUrls: ['./duration-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationInputComponent),
      multi: true
    }]
})
export class DurationInputComponent extends TemplateFormSectionBase {
  public val: number;
  public ms;
  public seconds;
  public minutes;
  public hours;
  public inEdit: boolean;


  set value(val) {  // this value is updated by programmatic changes if( ngModelValue !== undefined && this.ngModelValue !== ngModelValue){
    this.inEdit = false;
    this.val = val;
    this.msToHMSMS(val);
  }

  constructor(private eRef: ElementRef) {
    super();
  }

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.value = this.val;
    }
  }

  private msToHMSMS(ms: number) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    ms = ms - (hours * (1000 * 60 * 60));
    const minutes = Math.floor(ms / (1000 * 60));
    ms = ms - (minutes * (1000 * 60));
    const seconds = Math.floor(ms / 1000);
    const convertedMs = ms - (seconds * 1000);

    this.hours = this.toTwoDigits(hours);
    this.minutes = this.toTwoDigits(minutes);
    this.seconds = this.toTwoDigits(seconds);
    this.ms = this.toThreeDigits(convertedMs);
  }

  toTwoDigits(n: number) {
    return n > 9 ? '' + n : '0' + n;
  }

  toThreeDigits(n: number) {
    return n > 99 ? ('' + n) : (n > 9 ? '0' + n : '00' + n);
  }

  onChangePartial($event: any) {
    this.inEdit = false;
    const ms = this.currentTimeInMs();

    this.msToHMSMS(ms);
    this.onChange(ms);
  }

  checkChars($event: KeyboardEvent) {
    const isNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes($event.key);
    if (isNumbers) {
      this.inEdit = true;
    }
    return isNumbers;
  }

  focusOutInput() {
    const ms = this.currentTimeInMs();
    this.msToHMSMS(ms);
  }

  currentTimeInMs() {
    return (this.ms * 1 || 0) + (this.seconds * 1000 || 0) + (this.minutes * 1000 * 60 || 0) + (this.hours * 1000 * 60 * 60 || 0);
  }
}
