import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-toggle-archive',
  templateUrl: './toggle-archive.component.html',
  styleUrls  : ['./toggle-archive.component.scss']
})
export class ToggleArchiveComponent implements OnInit {
  @Input() showArchived: boolean;
  @Output() toggleArchived = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

}
