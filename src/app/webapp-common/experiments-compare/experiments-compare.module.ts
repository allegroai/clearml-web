import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentsCompareComponent} from './experiments-compare.component';
import {ExperimentsCompareRoutingModule} from './experiments-compare-routing.module';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {experimentsCompareReducers} from './reducers';
import {ExperimentsCompareDetailsEffects} from './effects/experiments-compare-details.effects';
import {ExperimentsCompareDebugImagesEffects} from './effects/experiments-compare-debug-images.effects';
import {ExperimentsCompareChartsEffects} from './effects/experiments-compare-charts.effects';
import {ExperimentsCompareMetricsValuesEffects} from './effects/experiments-compare-metrics-values.effects';
import {SMSharedModule} from '../shared/shared.module';
import {ExperimentCompareDetailsComponent} from './containers/experiment-compare-details/experiment-compare-details.component';
import {ExperimentCompareMetricValuesComponent} from './containers/experiment-compare-metric-values/experiment-compare-metric-values.component';
import {ExperimentCompareScalarChartsComponent} from './containers/experiment-compare-metric-charts/experiment-compare-scalar-charts.component';
import {ExperimentCompareHeaderComponent} from './dumbs/experiment-compare-header/experiment-compare-header.component';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {ExperimentComparePlotsComponent} from './containers/experiment-compare-plots/experiment-compare-plots.component';
import {ExperimentGraphsModule} from '../shared/experiment-graphs/experiment-graphs.module';

import {DebugImagesModule} from '../debug-images/debug-images.module';
import {ExperimentCompareSharedModule} from './shared/experiment-compare-shared.module';
import {ExperimentCompareGeneralDataComponent} from './dumbs/experiment-compare-general-data/experiment-compare-general-data.component';
import {GetKeyValueArrayPipePipe} from './get-key-value-array-pipe.pipe';
import {SelectCompareHeaderEffects} from './effects/select-experiment-for-compare-effects.service';
import {SelectExperimentsForCompareComponent} from './containers/select-experiments-for-compare/select-experiments-for-compare.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CompareCardListComponent} from './dumbs/compare-card-list/compare-card-list.component';
import {CompareCardBodyDirective} from './dumbs/compare-card-body.directive';
import {CompareCardExtraHeaderDirective} from './dumbs/compare-card-extra-header.directive';
import {CompareCardHeaderDirective} from './dumbs/compare-card-header.directive';
import {CommonExperimentSharedModule} from '../experiments/shared/common-experiment-shared.module';
import {TableDiffModule} from '../shared/ui-components/data/table-diff/table-diff.module';
import {CardModule} from '../shared/ui-components/panel/card2';
import {DrawerModule} from '../shared/ui-components/panel/drawer';
import {ParallelCoordinatesGraphComponent} from './dumbs/parallel-coordinates-graph/parallel-coordinates-graph.component';
import {ExperimentCompareHyperParamsGraphComponent} from './containers/experiment-compare-hyper-params-graph/experiment-compare-hyper-params-graph.component';
import {ExperimentsCompareScalarsGraphEffects} from './effects/experiments-compare-scalars-graph.effects';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatRadioModule} from '@angular/material/radio';
import {ExperimentCompareParamsComponent} from './containers/experiment-compare-params/experiment-compare-params.component';
import {ExperimentsCompareParamsEffects} from './effects/experiments-compare-params.effects';
import {FormsModule} from "@angular/forms";
import {UiComponentsModule} from "../shared/ui-components/ui-components.module";
import {SMMaterialModule} from "../shared/material/material.module";
import {ExperimentsCommonModule} from "../experiments/common-experiments.module";

export const compareSyncedKeys = [
  'charts.settingsList',
];


@NgModule({
  declarations: [
    ExperimentsCompareComponent,
    ExperimentCompareDetailsComponent,
    ExperimentCompareParamsComponent,
    ExperimentCompareMetricValuesComponent,
    ExperimentCompareScalarChartsComponent,
    ExperimentComparePlotsComponent,
    ExperimentCompareHeaderComponent,
    ExperimentCompareGeneralDataComponent,
    GetKeyValueArrayPipePipe,
    SelectExperimentsForCompareComponent,
    CompareCardListComponent,
    CompareCardBodyDirective,
    CompareCardExtraHeaderDirective,
    CompareCardHeaderDirective,
    ParallelCoordinatesGraphComponent,
    ExperimentCompareHyperParamsGraphComponent
  ],
  exports: [
    GetKeyValueArrayPipePipe
  ],
  imports: [
    CommonModule,
    DragDropModule,
    DebugImagesModule,
    SMSharedModule,
    SMMaterialModule,
    UiComponentsModule,
    TableDiffModule,
    ScrollingModule,
    CardModule,
    DrawerModule,
    ExperimentSharedModule,
    ExperimentsCompareRoutingModule,
    ExperimentGraphsModule,
    ExperimentCompareSharedModule,
    CommonExperimentSharedModule,
    ExperimentsCommonModule,
    StoreModule.forFeature('experimentsCompare', experimentsCompareReducers),
    EffectsModule.forFeature([
      ExperimentsCompareDetailsEffects,
      ExperimentsCompareParamsEffects,
      ExperimentsCompareDebugImagesEffects,
      ExperimentsCompareChartsEffects,
      ExperimentsCompareMetricsValuesEffects,
      SelectCompareHeaderEffects,
      ExperimentsCompareScalarsGraphEffects]),
    MatRadioModule,
    FormsModule,
  ]
})
export class ExperimentsCompareModule {
}

