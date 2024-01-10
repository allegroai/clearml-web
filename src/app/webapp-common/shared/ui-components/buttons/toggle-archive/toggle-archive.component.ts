import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sm-toggle-archive',
  templateUrl: './toggle-archive.component.html',
  styleUrls: ['./toggle-archive.component.scss'],
  standalone: true,
  imports: [
    TooltipDirective,
    NgIf
  ]
})
export class ToggleArchiveComponent {
  @Input() showArchived: boolean;
  @Input() minimize: boolean;
  @Output() toggleArchived = new EventEmitter<boolean>();
}
