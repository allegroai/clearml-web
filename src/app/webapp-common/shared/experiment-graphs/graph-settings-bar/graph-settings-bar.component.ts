import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';

@Component({
  selector   : 'sm-graph-settings-bar',
  templateUrl: './graph-settings-bar.component.html',
  styleUrls  : ['./graph-settings-bar.component.scss']
})
export class GraphSettingsBarComponent implements OnInit {
  readonly ScalarKeyEnum            = ScalarKeyEnum;
  @Input() smoothWeight: number;
  @Input() xAxisType: ScalarKeyEnum = ScalarKeyEnum.Iter;
  @Output() changeWeight            = new EventEmitter();
  @Output() changeXAxisType         = new EventEmitter<ScalarKeyEnum>();
  @Output() toggleSettings          = new EventEmitter();
  constructor() {
  }

  ngOnInit() {
  }

}
