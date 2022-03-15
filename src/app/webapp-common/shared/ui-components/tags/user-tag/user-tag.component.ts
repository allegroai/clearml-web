import {Component, Input, Output, EventEmitter} from '@angular/core';
import {TagColor} from '../../../../core/actions/projects.actions';

@Component({
  selector: 'sm-user-tag',
  templateUrl: './user-tag.component.html',
  styleUrls: ['./user-tag.component.scss']
})
export class UserTagComponent {
  @Input() caption: string;
  @Input() colors: TagColor;
  @Input() foreground: string;
  @Input() tooltip: boolean;
  @Input() disabledRemove: string;
  @Output() remove = new EventEmitter<string>();
  @Output() add = new EventEmitter<MouseEvent>();

  constructor() { }

  onRemoveClicked(caption: string) {
    this.remove.emit(caption);
  }
}
