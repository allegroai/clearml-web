import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-select-hyper-params-for-custom-col',
  templateUrl: './select-hyper-params-for-custom-col.component.html',
  styleUrls  : ['./select-hyper-params-for-custom-col.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectHyperParamsForCustomColComponent {

  public metricsCols: string[];

  @Input() hyperParams: string[];
  @Output() getMetricsToDisplay      = new EventEmitter();
  @Output() selectedHyperParamToShow = new EventEmitter();
  @Output() goBack                   = new EventEmitter();
  @Output() clearSelection           = new EventEmitter();

  @Input() set tableCols(tableCols) {
    this.metricsCols = tableCols.map(tableCol => tableCol.id.replace('execution.parameters.',''));
  }


  public toggleParamToDisplay({param, value}) {
    this.selectedHyperParamToShow.emit({param, addCol: !value});
  }

}
