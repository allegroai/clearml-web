import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';
import {MatSelectChange} from '@angular/material/select';
import {GroupByCharts} from '../../../experiments/reducers/common-experiment-output.reducer';

@Component({
  selector: 'sm-graph-settings-bar',
  templateUrl: './graph-settings-bar.component.html',
  styleUrls: ['./graph-settings-bar.component.scss']
})
export class GraphSettingsBarComponent {
  readonly ScalarKeyEnum = ScalarKeyEnum;
  @Input() smoothWeight: number;
  @Input() xAxisType: ScalarKeyEnum = ScalarKeyEnum.Iter;
  @Input() groupBy: GroupByCharts = 'metric';
  @Input() groupByOptions: {name: string; value: GroupByCharts }[];
  @Input() verticalLayout: boolean = false;
  @Output() changeWeight = new EventEmitter();
  @Output() changeXAxisType = new EventEmitter<ScalarKeyEnum>();
  @Output() changeGroupBy = new EventEmitter<GroupByCharts>();
  @Output() toggleSettings = new EventEmitter();

  xAxisTypeOption = [
    {
      name: 'Iterations',
      value: ScalarKeyEnum.Iter
    },
    {
      name: 'Time from start',
      value: ScalarKeyEnum.Timestamp
    },
    {
      name: 'Wall time',
      value: ScalarKeyEnum.IsoTime
    },
  ];

  xAxisTypeChanged(key: MatSelectChange) {
    this.changeXAxisType.emit(key.value);
  }

  groupByChanged(key: MatSelectChange) {
    this.changeGroupBy.emit(key.value);
  }
}
