import {Component, computed, EventEmitter, input, Output} from '@angular/core';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseEntityHeaderComponent} from '@common/shared/entity-page/base-entity-header/base-entity-header.component';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {
  SelectionEvent
} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {CustomColumnMode} from '@common/experiments/shared/common-experiments.const';

@Component({
  selector   : 'sm-model-header',
  templateUrl: './model-header.component.html',
  styleUrls  : ['./model-header.component.scss']
})
export class ModelHeaderComponent extends BaseEntityHeaderComponent {

  protected readonly customColumnModeEnum = CustomColumnMode;
  customColumnMode: CustomColumnMode;

  minimizedView = input<boolean>();
  tableFilters = input<{ [s: string]: FilterMetadata }>();
  sharedView = input<boolean>(false);
  isArchived = input<boolean>();
  hideArchiveToggle = input<boolean>();
  disableCreateNewButton = input<boolean>();
  metadataKeys = input<string[]>();
  metricVariants = input<Array<MetricVariantResult>>();
  tableMode = input<'table' | 'info' | 'compare'>();
  rippleEffect = input<boolean>();
  hideNavigation = input<boolean>();
  tableCols = input<ISmCol[]>();
  tableCols2 = computed(() => this.tableCols()?.filter(col => col.header !== ''));

  @Output() isArchivedChanged = new EventEmitter<boolean>();
  @Output() addModelClicked   = new EventEmitter();
  @Output() refreshListClicked       = new EventEmitter();
  @Output() setAutoRefresh           = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() selectedMetricToShow     = new EventEmitter<SelectionEvent>();
  @Output() selectMetadataKeysActiveChanged = new EventEmitter();
  @Output() clearTableFilters        = new EventEmitter<{ [s: string]: FilterMetadata }>();
  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{key: string; show: boolean}>();
  @Output() tableModeChanged = new EventEmitter<'table' | 'info' | 'compare'>();
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();

  onIsArchivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }
}
