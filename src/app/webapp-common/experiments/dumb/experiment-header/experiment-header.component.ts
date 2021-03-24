import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MetricVariantResult} from '../../../../business-logic/model/projects/metricVariantResult';
import {CustomColumnMode} from '../../shared/common-experiments.const';

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
  @Output() addExperimentClicked     = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() removeColFromList        = new EventEmitter();
  @Output() getMetricsToDisplay      = new EventEmitter();
  @Output() selectedMetricToShow     = new EventEmitter();
  @Output() selectedHyperParamToShow = new EventEmitter();
  @Output() refreshListClicked       = new EventEmitter();
  @Output() setAutoRefresh           = new EventEmitter();
  @Output() clearSelection           = new EventEmitter();


  onIsArchivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }

  onAddExperimentClicked() {
    this.addExperimentClicked.emit();
  }

  addCustomColClicked(mode: CustomColumnMode) {
    this.selectMetricActive = mode;
  }

  onRefreshListClicked() {
    this.refreshListClicked.emit();
  }

  setCustomColumnMode(mode: CustomColumnMode) {
    this.selectMetricActive = mode;
  }

}
