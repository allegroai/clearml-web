import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ClickStopPropagationDirective
  ]
})
export class OverlayComponent {

  @Input() backdropActive;
  @Input() transparent: boolean = false;

}
