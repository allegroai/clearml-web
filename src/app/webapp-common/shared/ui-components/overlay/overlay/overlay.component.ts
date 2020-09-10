import {Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-overlay',
  templateUrl: './overlay.component.html',
  styleUrls  : ['./overlay.component.scss']
})
export class OverlayComponent {

  @Input() backdropActive;
  @Input() transparent: boolean = false;

}
