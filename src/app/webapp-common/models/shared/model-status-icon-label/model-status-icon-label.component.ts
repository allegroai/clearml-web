import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector   : 'sm-model-status-icon-label',
  templateUrl: './model-status-icon-label.component.html',
  styleUrls  : ['./model-status-icon-label.component.scss']
})
export class ModelStatusIconLabelComponent implements OnInit {
  @Input() showLabel= true;
  @Input() status;
  @Input() type;

  constructor() {
  }

  ngOnInit() {
  }

}
