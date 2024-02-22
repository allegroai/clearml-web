import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseEntityHeaderComponent} from '@common/shared/entity-page/base-entity-header/base-entity-header.component';
import {SelectionEvent} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {Option} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {trackByValue} from '@common/shared/utils/forms-track-by';
import {resourceToIconMap} from '~/features/experiments/experiments.consts';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import { Pipeline } from '~/business-logic/model/pipelines/pipeline';



@Component({
  selector: 'sm-edit-pipeline-header',
  templateUrl: './edit-pipeline-header.component.html',
  styleUrls: ['./edit-pipeline-header.component.scss']
})
export class EditPipelineHeaderComponent extends BaseEntityHeaderComponent implements OnInit{
  private _tableCols: any;
  toggleButtons: Option[];
 


  get tableCols() {
    return this._tableCols;
  }
  @Input() pipelineData: Pipeline;
  @Output() createPipelineStep        = new EventEmitter();
  @Output() savePipeline        = new EventEmitter();
  // @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();
  // @Output() removeColFromList        = new EventEmitter<ISmCol['id']>();
  // @Output() getMetricsToDisplay      = new EventEmitter();
  // @Output() selectedMetricToShow     = new EventEmitter<SelectionEvent>();
  // @Output() selectedHyperParamToShow = new EventEmitter<{param: string; addCol: boolean}>();
  // @Output() setAutoRefresh = new EventEmitter<boolean>();
  // @Output() toggleShowCompareSettings = new EventEmitter<boolean>();
  // @Output() compareViewChanged = new EventEmitter<'scalars' | 'plots'>();
  // @Output() clearSelection = new EventEmitter();
  // @Output() clearTableFilters = new EventEmitter<{ [s: string]: FilterMetadata }>();
  // @Output() tableModeChanged = new EventEmitter<'table' | 'info' | 'compare'>();
  protected readonly resourceToIconMap = resourceToIconMap;
  protected readonly trackByValue = trackByValue;

  ngOnInit(): void {
    this.toggleButtons = [
      {label: 'Table view', value: 'table', icon: 'al-ico-table-view'},
      {label: 'Details view', value: 'info', icon: 'al-ico-experiment-view'},
      ...(this.entityType === EntityTypeEnum.experiment ? [{label: 'Compare view', value: 'compare', icon: 'al-ico-charts-view'}] : [])
    ];
  }

  addNewStep() {
    this.createPipelineStep.emit();
  }
  savePipelineClicked() {
    this.savePipeline.emit();
  }
}
