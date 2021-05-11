import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-select-hyper-params-for-custom-col',
  templateUrl: './select-hyper-params-for-custom-col.component.html',
  styleUrls  : ['./select-hyper-params-for-custom-col.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectHyperParamsForCustomColComponent {

  public metricsCols: string[];

  @Input() hyperParams: {[section: string]: any[]};
  @Output() getMetricsToDisplay      = new EventEmitter();
  @Output() selectedHyperParamToShow = new EventEmitter<{param: string; addCol: boolean}>();
  @Output() goBack                   = new EventEmitter();
  @Output() clearSelection           = new EventEmitter();

  @Input() set tableCols(tableCols) {
    this.metricsCols = tableCols;
  }


  public toggleParamToDisplay({param, value}) {

    this.selectedHyperParamToShow.emit({param: `hyperparams.${param}`, addCol: !value});
  }

}
