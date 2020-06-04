import {Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-readonly-label',
  templateUrl: './readonly-label.component.html',
  styleUrls  : ['./readonly-label.component.scss']
})
export class ReadonlyLabelComponent {

  @Input() readonly;
  @Input() value;
  @Input() label;
  @Input() readonlyClassName;
}
