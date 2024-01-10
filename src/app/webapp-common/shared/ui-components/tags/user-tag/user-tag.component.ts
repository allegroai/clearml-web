import {Component, Input, Output, EventEmitter} from '@angular/core';
import {TagColor} from '@common/core/actions/projects.actions';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NgIf} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'sm-user-tag',
  templateUrl: './user-tag.component.html',
  styleUrls: ['./user-tag.component.scss'],
  imports: [
    TooltipDirective,
    NgIf,
    MatProgressSpinnerModule
  ],
  standalone: true
})
export class UserTagComponent {
  @Input() caption: string;
  @Input() colors: TagColor;
  @Input() foreground: string;
  @Input() tooltip: boolean;
  @Input() disabledRemove: string;
  @Input() readonly: boolean = false;
  @Output() remove = new EventEmitter<string>();
  @Output() add = new EventEmitter<MouseEvent>();

  onRemoveClicked(caption: string) {
    this.remove.emit(caption);
  }
}
