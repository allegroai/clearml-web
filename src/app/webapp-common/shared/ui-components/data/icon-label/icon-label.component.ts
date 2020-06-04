import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-icon-label',
  templateUrl: './icon-label.component.html',
  styleUrls  : ['./icon-label.component.scss']
})
export class IconLabelComponent implements OnInit {
  @Input() label;
  @Input() iconClass;
  @Input() disabled;
  @Output() iconLabelClicked = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

}
