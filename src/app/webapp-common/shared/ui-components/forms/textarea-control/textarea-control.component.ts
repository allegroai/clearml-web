import {ChangeDetectionStrategy, Component, Input, ChangeDetectorRef} from '@angular/core';
import {ImmutableFormField} from '../immutableFormField';

@Component({
  selector       : 'sm-textarea-control',
  templateUrl    : './textarea-control.component.html',
  styleUrls      : ['./textarea-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TextareaControlComponent extends ImmutableFormField {

  @Input() rows: number = 12;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

}
