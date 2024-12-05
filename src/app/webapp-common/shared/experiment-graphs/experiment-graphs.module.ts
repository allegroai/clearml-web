import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSliderModule} from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ResizableModule} from 'angular-resizable-element';
import {ExperimentGraphsComponent} from './experiment-graphs.component';
import {GraphSettingsBarComponent} from './graph-settings-bar/graph-settings-bar.component';
import {GraphScalarDataToMetric} from './graph-scalar-data-to-metric.pipe';
import {GraphPlotDataToMetric} from './graph-plot-data-to-metric.pipe';
import {SingleValueSummaryTableComponent} from '../single-value-summary-table/single-value-summary-table.component';
import {SingleGraphModule} from '@common/shared/single-graph/single-graph.module';
import {MatInputModule} from '@angular/material/input';
import {SingleGraphStateModule} from '@common/shared/single-graph/single-graph-state.module';
import {
  ExperimentMetricDataTableComponent
} from '@common/shared/experiment-graphs/experiment-metric-data-table/experiment-metric-data-table.component';
import {TableModule} from 'primeng/table';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {PushPipe} from '@ngrx/component';
import {
  SelectableGroupedFilterListComponent
} from '@common/shared/ui-components/data/selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';




const declarations= [
  ExperimentMetricDataTableComponent,
  ExperimentGraphsComponent,
  GraphSettingsBarComponent,
  GraphScalarDataToMetric,
  GraphPlotDataToMetric,
];
@NgModule({
  declarations,
  exports: declarations,
  imports: [
    CommonModule,
    MatSliderModule,
    MatSelectModule,
    FormsModule,
    ResizableModule,
    SingleGraphModule,
    SingleGraphStateModule,
    MatInputModule,
    SingleValueSummaryTableComponent,
    TableModule,
    ClickStopPropagationDirective,
    LabeledFormFieldDirective,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    PushPipe,
    SelectableGroupedFilterListComponent,
    ShowTooltipIfEllipsisDirective,
    TooltipDirective,
    ReactiveFormsModule,
  ]
})
export class ExperimentGraphsModule { }
