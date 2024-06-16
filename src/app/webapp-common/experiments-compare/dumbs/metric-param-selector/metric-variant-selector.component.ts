import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {CustomColumnsListComponent} from '@common/shared/components/custom-columns-list/custom-columns-list.component';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';

import {
  SelectMetadataKeysCustomColsComponent
} from '@common/shared/components/select-metadata-keys-custom-cols/select-metadata-keys-custom-cols.component';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {uniqBy} from 'lodash-es';
import {
  SelectionEvent, SelectMetricForCustomColComponent
} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {SelectedMetricVariant} from '@common/experiments-compare/experiments-compare.constants';
import {MetricVariantToNamePipe} from '@common/shared/pipes/metric-variant-to-name.pipe';
import {trackByIndex} from '@common/shared/utils/forms-track-by';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {MetricValueTypeStrings} from '@common/shared/utils/tableParamEncode';

@Component({
  selector: 'sm-metric-variant-selector',
  standalone: true,
  imports: [
    MenuComponent,
    ClickStopPropagationDirective,
    CustomColumnsListComponent,
    ExperimentCompareSharedModule,
    SelectMetadataKeysCustomColsComponent,
    MetricVariantToNamePipe,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective,
    SelectMetricForCustomColComponent
  ],
  templateUrl: './metric-variant-selector.component.html',
  styleUrl: './metric-variant-selector.component.scss'
})
export class MetricVariantSelectorComponent {
  public metricVariantsSet: Array<MetricVariantResult>;
  @Input() selectedMetricVariants: SelectedMetricVariant[];
  @Input() multiSelect: boolean = false;
  @Input() skipValueType: boolean = false;
  @Input() title: string;
  @Input() set metricVariants(metricVariants: Array<MetricVariantResult>) {
    this.metricVariantsSet = uniqBy(metricVariants?.map(metricVariant => {
      return {...metricVariant, key: metricVariant.metric_hash + metricVariant.variant_hash};
    }), 'key')?.map(({key, ...metricVariant}) => metricVariant);
  }

  @Output() selectMetricVariant = new EventEmitter<SelectionEvent>();
  @Output() removeMetric = new EventEmitter<SelectedMetricVariant>();
  @Output() clearSelection = new EventEmitter();
  protected readonly trackByIndex = trackByIndex;

  protected readonly MetricValueTypeStrings = MetricValueTypeStrings;
   searchText: string;
}
