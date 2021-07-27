import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MetricVariantResult} from '../../../../business-logic/model/projects/metricVariantResult';
import {CustomColumnMode} from '../../shared/common-experiments.const';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {MetricValueType} from '../../../experiments-compare/reducers/experiments-compare-charts.reducer';

@Component({
  selector   : 'sm-experiment-header',
  templateUrl: './experiment-header.component.html',
  styleUrls  : ['./experiment-header.component.scss']
})
export class ExperimentHeaderComponent {
  public selectMetricActive: CustomColumnMode;
  private _tableCols: any;


  @Input() isArchived: boolean;
  @Input() metricVariants: Array<MetricVariantResult>;
  @Input() hyperParams: { [section: string]: any[] };
  @Input() minimizedView: boolean;
  @Input() isMetricsLoading: boolean;
  @Input() autoRefreshState: boolean;
  @Input() sharedView: boolean;

  @Input() set tableCols(tableCols) {
    this._tableCols = tableCols.filter(col => col.header !== '');
  }

  get tableCols() {
    return this._tableCols;
  }

  @Output() isArchivedChanged        = new EventEmitter<boolean>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();
  @Output() removeColFromList        = new EventEmitter<ISmCol['id']>();
  @Output() getMetricsToDisplay      = new EventEmitter();
  @Output() selectedMetricToShow     = new EventEmitter<{
    variant: MetricVariantResult;
    addCol: boolean;
    valueType: MetricValueType;
  }>();
  @Output() selectedHyperParamToShow = new EventEmitter<{param: string; addCol: boolean}>();
  @Output() refreshListClicked       = new EventEmitter<boolean>();
  @Output() setAutoRefresh           = new EventEmitter<boolean>();
  @Output() clearSelection           = new EventEmitter();


  onIsArchivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }

  onRefreshListClicked() {
    this.refreshListClicked.emit(false);
  }

  setCustomColumnMode(mode: CustomColumnMode) {
    this.selectMetricActive = mode;
  }

}
