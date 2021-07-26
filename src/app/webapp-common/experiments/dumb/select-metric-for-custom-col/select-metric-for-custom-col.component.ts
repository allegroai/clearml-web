import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {MetricVariantResult} from '../../../../business-logic/model/projects/metricVariantResult';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {MetricValueType} from '../../../experiments-compare/reducers/experiments-compare-charts.reducer';

@Component({
  selector   : 'sm-select-metric-for-custom-col',
  templateUrl: './select-metric-for-custom-col.component.html',
  styleUrls  : ['./select-metric-for-custom-col.component.scss']
})
export class SelectMetricForCustomColComponent {
  public metricTree;
  public metrics: string[];
  public metricsCols: {[metVar: string]: string[]};
  public searchText: any;

  // private _searchTerm: string;

  @Input() set metricVariants(metricVar: Array<MetricVariantResult>) {
    this.metricTree = metricVar.reduce((result, metric) => {
      result[metric.metric] ? result[metric.metric].push(metric) : result[metric.metric] = [metric];
      return result;
    }, {});
    this.metrics    = Object.keys(this.metricTree);
  }

  @Input() set tableCols(tableCols) {
    this.metricsCols = {};
    tableCols.filter(tableCol => tableCol.metric_hash).forEach(tableCol => {
      this.metricsCols[tableCol.metric_hash + tableCol.variant_hash] ?
        this.metricsCols[tableCol.metric_hash + tableCol.variant_hash].push(tableCol.valueType) :
        this.metricsCols[tableCol.metric_hash + tableCol.variant_hash] = [tableCol.valueType];
    });
  }
  @Input() multiSelect: boolean = true;

  // @Input() set searchTerm(searchTerm: string) {
  //   this.filteredList = this.list ? this.filterList(this.list, searchTerm) : [];
  //   this._searchTerm  = searchTerm;
  // }
  //
  // get searchTerm() {
  //   return this._searchTerm;
  // }

  @Output() getMetricsToDisplay  = new EventEmitter();
  @Output() selectedMetricToShow = new EventEmitter<{
    variant: MetricVariantResult;
    addCol: boolean;
    valueType: MetricValueType;
  }>();
  @Output() goBack               = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  toggleAllMetricsToDisplay(variant: any, on: boolean) {
    if (!on) {
      this.toggleMetricToDisplay(variant, on, null);
      this.multiSelect ?
        this.metricsCols[variant.metric_hash + variant.variant_hash] = [] :
        this.metricsCols = {[variant.metric_hash + variant.variant_hash]: []};
    } else {
      this.toggleMetricToDisplay(variant, on, 'value');
      this.toggleMetricToDisplay(variant, on, 'min_value');
      this.toggleMetricToDisplay(variant, on, 'max_value');
    }
  }

  public toggleMetricToDisplay(variant: ISmCol, value: boolean, valueType: MetricValueType) {
    this.selectedMetricToShow.emit({variant, addCol: !value, valueType});
  }

  public searchQ(value: string) {
    this.searchText = value;
    this.changeDetectorRef.detectChanges();
  }

  public isArray(obj: unknown) {
    return Array.isArray(obj);
  }

  hasSelectedVariant = (metric: string) =>
    this.metricTree[metric].some(variant => this.metricsCols[variant.metric_hash + variant.variant_hash] !== undefined);
}
