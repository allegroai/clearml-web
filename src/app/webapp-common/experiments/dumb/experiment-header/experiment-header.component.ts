import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseEntityHeaderComponent} from '@common/shared/entity-page/base-entity-header/base-entity-header.component';
import {MetricValueType} from '@common/experiments-compare/experiments-compare.constants';

@Component({
  selector   : 'sm-experiment-header',
  templateUrl: './experiment-header.component.html',
  styleUrls  : ['./experiment-header.component.scss']
})
export class ExperimentHeaderComponent extends BaseEntityHeaderComponent {
  private _tableCols: any;

  @Input() isArchived: boolean;
  @Input() metricVariants: Array<MetricVariantResult>;
  @Input() hyperParams: { [section: string]: any[] };
  @Input() minimizedView: boolean;
  @Input() isMetricsLoading: boolean;
  @Input() tableFilters: { [s: string]: FilterMetadata };
  @Input() sharedView: boolean;
  @Input() showNavbarLinks: boolean;
  @Input() tableMode: string;
  @Input() rippleEffect: boolean;
  @Input() addButtonTemplate: TemplateRef<any>;

  @Input() set tableCols(tableCols) {
    this._tableCols = tableCols?.filter(col => col.header !== '');
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
  @Output() setAutoRefresh = new EventEmitter<boolean>();
  @Output() clearSelection = new EventEmitter();
  @Output() clearTableFilters = new EventEmitter<{ [s: string]: FilterMetadata }>();
  @Output() tableModeChanged = new EventEmitter<'table' | 'info'>();


  onIsArchivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }
}
