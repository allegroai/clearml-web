import {Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-number-counter',
  templateUrl: './number-counter.component.html',
  styleUrls  : ['./number-counter.component.scss'],
  standalone: true,
})
export class NumberCounterComponent {
  @Input() counter;
  @Input() label;
}
