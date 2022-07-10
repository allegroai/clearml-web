import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExperimentGraphsComponent} from './experiment-graphs.component';
import {UiComponentsModule} from '../ui-components/ui-components.module';
import {SingleGraphComponent} from './single-graph/single-graph.component';
import {GraphSettingsBarComponent} from './graph-settings-bar/graph-settings-bar.component';
import { MatSliderModule } from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {ResizableModule} from 'angular-resizable-element';
import {GraphViewerComponent} from './graph-viewer/graph-viewer.component';
import {GraphScalarDataToMetric} from './graph-scalar-data-to-metric.pipe';
import {GraphPlotDataToMetric} from './graph-plot-data-to-metric.pipe';
import {SharedPipesModule} from '../pipes/shared-pipes.module';
import { SingleValueSummaryTableComponent } from './single-value-summary-table/single-value-summary-table.component';

const declarations= [
  ExperimentGraphsComponent,
  SingleGraphComponent,
  GraphSettingsBarComponent,
  GraphViewerComponent,
  GraphScalarDataToMetric,
  GraphPlotDataToMetric,
  SingleValueSummaryTableComponent
];
@NgModule({
  declarations,
  exports: declarations,
  imports: [
    CommonModule,
    UiComponentsModule,
    MatSliderModule,
    FormsModule,
    ResizableModule,
    SharedPipesModule,
  ]
})
export class ExperimentGraphsModule { }
