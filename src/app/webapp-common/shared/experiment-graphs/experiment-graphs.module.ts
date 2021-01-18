import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExperimentGraphsComponent} from './experiment-graphs.component';
import {UiComponentsModule} from '../ui-components/ui-components.module';
import {SingleGraphComponent} from './single-graph/single-graph.component';
import {GraphSettingsBarComponent} from './graph-settings-bar/graph-settings-bar.component';
import { MatSliderModule } from '@angular/material/slider';
import {PlotlyGraphBase} from './single-graph/plotly-graph-base';
import {FormsModule} from '@angular/forms';

const declarations= [ExperimentGraphsComponent, PlotlyGraphBase, SingleGraphComponent, GraphSettingsBarComponent];
@NgModule({
  declarations: declarations,
  exports: declarations,
  imports: [
    CommonModule,
    UiComponentsModule,
    MatSliderModule,
    FormsModule,
  ]
})
export class ExperimentGraphsModule { }
