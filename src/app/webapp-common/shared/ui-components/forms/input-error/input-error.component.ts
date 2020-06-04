import {Component, Input} from '@angular/core';

@Component({
  selector: 'sm-input-error',
  templateUrl: './input-error.component.html',
  styleUrls: ['./input-error.component.scss']
})
export class InputErrorComponent {

  @Input() visibleWhen = true;
  @Input() message;

}
