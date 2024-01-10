import {Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls  : ['./loading-button.component.scss'],
  standalone: true,
})
export class LoadingButtonComponent {
  @Input() label    = 'CREATE NEW';
  @Input() disabled = false;
  @Input() loading;
}
