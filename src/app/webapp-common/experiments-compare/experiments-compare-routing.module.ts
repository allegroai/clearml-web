import {ExperimentsCompareComponent} from './experiments-compare.component';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {SMSharedModule} from '../shared/shared.module';
import {ExperimentCompareDetailsComponent} from './containers/experiment-compare-details/experiment-compare-details.component';
import {ExperimentCompareMetricValuesComponent} from './containers/experiment-compare-metric-values/experiment-compare-metric-values.component';
import {ExperimentCompareScalarChartsComponent} from './containers/experiment-compare-metric-charts/experiment-compare-scalar-charts.component';
import {ExperimentComparePlotsComponent} from './containers/experiment-compare-plots/experiment-compare-plots.component';
import {DebugImagesComponent} from '../debug-images/debug-images.component';
import {ExperimentCompareHyperParamsGraphComponent} from './containers/experiment-compare-hyper-params-graph/experiment-compare-hyper-params-graph.component';
import {RouterHelperGuard} from './experiment-compare-router-helper.guard';
import {ExperimentCompareParamsComponent} from './containers/experiment-compare-params/experiment-compare-params.component';


export const routes: Routes = [
  {
    path: '',
    component: ExperimentsCompareComponent,
    data: {search: false},
    children: [
      {path: '', redirectTo: 'details', pathMatch: 'full'},
      {path: 'metrics-values', redirectTo: 'scalars/values', pathMatch: 'full'},
      {path: 'metrics-charts', redirectTo: 'scalars/graph', pathMatch: 'full'},

      {path: 'details', component: ExperimentCompareDetailsComponent, data: {mode: 'details'}},
      {path: 'hyper-params/values', component: ExperimentCompareParamsComponent, canActivate: [RouterHelperGuard], data: {mode: 'hyper-params'}},
      {path: 'hyper-params/graph', component: ExperimentCompareHyperParamsGraphComponent},
      {path: 'scalars/values', component: ExperimentCompareMetricValuesComponent, canActivate: [RouterHelperGuard]},
      {path: 'scalars/graph', component: ExperimentCompareScalarChartsComponent},
      {path: 'metrics-plots', component: ExperimentComparePlotsComponent},
      {path: 'debug-images', component: DebugImagesComponent, data: {mergeIterations: true, multiple: true}},
    ]
  },
];

@NgModule({
  imports: [
    SMSharedModule,
    RouterModule.forChild(routes),

  ],
  exports: [
    RouterModule
  ]
})
export class ExperimentsCompareRoutingModule {
}

