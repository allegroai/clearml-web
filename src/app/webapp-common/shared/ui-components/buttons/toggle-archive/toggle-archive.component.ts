import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-toggle-archive',
  templateUrl: './toggle-archive.component.html',
  styleUrls  : ['./toggle-archive.component.scss']
})
export class ToggleArchiveComponent {
  @Input() showArchived: boolean;
  @Input() minimize: boolean;
  @Output() toggleArchived = new EventEmitter<boolean>();
}
