import {Component, computed, EventEmitter, input, OnInit, Output, TemplateRef} from '@angular/core';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseEntityHeaderComponent} from '@common/shared/entity-page/base-entity-header/base-entity-header.component';
import {SelectionEvent} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {Option} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {trackByValue} from '@common/shared/utils/forms-track-by';
import {resourceToIconMap} from '~/features/experiments/experiments.consts';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {CustomColumnMode} from '@common/experiments/shared/common-experiments.const';

@Component({
  selector   : 'sm-experiment-header',
  templateUrl: './experiment-header.component.html',
  styleUrls  : ['./experiment-header.component.scss']
})
export class ExperimentHeaderComponent extends BaseEntityHeaderComponent implements OnInit{

  protected readonly customColumnModeEnum = CustomColumnMode;
  customColumnMode: CustomColumnMode;
  toggleButtons: Option[];

  isArchived = input<boolean>();
  metricVariants = input<Array<MetricVariantResult>>();
  hyperParams = input<any[]>();
  minimizedView = input<boolean>();
  isMetricsLoading = input<boolean>();
  tableFilters = input<{ [s: string]: FilterMetadata }>();
  sharedView = input<boolean>();
  showNavbarLinks = input<boolean>();
  tableMode = input<'table' | 'info' | 'compare'>();
  compareView = input<'scalars' | 'plots'>();
  showCompareScalarSettings = input<boolean>();
  rippleEffect = input<boolean>();
  addButtonTemplate = input<TemplateRef<{smallScreen: boolean}>>();

  tableCols = input<ISmCol[]>();
  tableColsWithHeader = computed(() => this.tableCols()?.filter(col => col.header !== ''));

  @Output() isArchivedChanged        = new EventEmitter<boolean>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();
  @Output() removeColFromList        = new EventEmitter<ISmCol['id']>();
  @Output() getMetricsToDisplay      = new EventEmitter();
  @Output() selectedMetricToShow     = new EventEmitter<SelectionEvent>();
  @Output() selectedHyperParamToShow = new EventEmitter<{param: string; addCol: boolean}>();
  @Output() setAutoRefresh = new EventEmitter<boolean>();
  @Output() toggleShowCompareSettings = new EventEmitter<boolean>();
  @Output() compareViewChanged = new EventEmitter<'scalars' | 'plots'>();
  @Output() clearSelection = new EventEmitter();
  @Output() clearTableFilters = new EventEmitter<{ [s: string]: FilterMetadata }>();
  @Output() tableModeChanged = new EventEmitter<'table' | 'info' | 'compare'>();
  protected readonly resourceToIconMap = resourceToIconMap;
  protected readonly trackByValue = trackByValue;

  ngOnInit(): void {
    this.toggleButtons = [
      {label: 'Table view', value: 'table', icon: 'al-ico-table-view'},
      {label: 'Details view', value: 'info', icon: 'al-ico-experiment-view'},
      ...(this.entityType === EntityTypeEnum.experiment ? [{label: 'Compare view', value: 'compare', icon: 'al-ico-charts-view'}] : [])
    ];
  }
}
