import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {TagColor} from '../../../../core/actions/projects.actions';

@Component({
  selector: 'sm-user-tag',
  templateUrl: './user-tag.component.html',
  styleUrls: ['./user-tag.component.scss']
})
export class UserTagComponent implements OnInit {
  @Input() caption: string;
  @Input() colors: TagColor;
  @Input() foreground: string;
  @Input() tooltip: boolean;
  @Input() disabledRemove: boolean;
  @Output() remove = new EventEmitter<string>();
  @Output() add = new EventEmitter<MouseEvent>();

  constructor() { }

  ngOnInit(): void {
  }

  onRemoveClicked(caption: string) {
    this.remove.emit(caption);
  }
}
