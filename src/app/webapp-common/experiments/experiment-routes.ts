import {Routes} from '@angular/router';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {ExperimentInfoComponent} from '../../features/experiments/containers/experiment-info/experiment-info.component';
import {ExperimentInfoExecutionComponent} from './containers/experiment-info-execution/experiment-info-execution.component';
import {LeavingBeforeSaveAlertGuard} from '../shared/guards/leaving-before-save-alert.guard';
import {ExperimentInfoArtifactsComponent} from './containers/experiment-info-aritfacts/experiment-info-artifacts.component';
import {ExperimentInfoModelComponent} from './containers/experiment-info-model/experiment-info-model.component';
import {ExperimentInfoArtifactItemComponent} from './containers/experiment-info-artifact-item/experiment-info-artifact-item.component';
import {ExperimentInfoHyperParametersComponent} from './containers/experiment-info-hyper-parameters/experiment-info-hyper-parameters.component';
import {ExperimentInfoTaskModelComponent} from './containers/experiment-info-task-model/experiment-info-task-model.component';
import {ExperimentInfoHyperParametersFormContainerComponent} from './containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component';
import {ExperimentInfoGeneralComponent} from './containers/experiment-info-general/experiment-info-general.component';
import {ExperimentOutputComponent} from '../../features/experiments/containers/experiment-ouptut/experiment-output.component';
import {ExperimentOutputScalarsComponent} from './containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentOutputPlotsComponent} from './containers/experiment-output-plots/experiment-output-plots.component';
import {DebugImagesComponent} from '../debug-images/debug-images.component';
import {ExperimentOutputLogComponent} from './containers/experiment-output-log/experiment-output-log.component';

export const routes: Routes = [
  {
    path: '',
    component: ExperimentsComponent,
    children: [
      {
        path: ':experimentId', component: ExperimentInfoComponent,
        children: [
          {path: '', redirectTo: 'execution', pathMatch: 'full'},
          {
            path: 'execution',
            component: ExperimentInfoExecutionComponent,
            canDeactivate: [LeavingBeforeSaveAlertGuard],
            data: {minimized: true}
          },
          {
            path: 'artifacts',
            component: ExperimentInfoArtifactsComponent,
            canDeactivate: [LeavingBeforeSaveAlertGuard],
            data     : {minimized: true},
            children: [
              {path: '', redirectTo: 'input-model', pathMatch: 'full'},
              {path: 'input-model/:modelId', component: ExperimentInfoModelComponent, data: {outputModel: false}},
              {path: 'output-model/:modelId', component: ExperimentInfoModelComponent , data: {outputModel: true}},
              {
                path: 'artifact/:artifactId',
                children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]
              },
              {path: 'other/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]}
            ]
          },
          {
            path: 'hyper-params',
            component: ExperimentInfoHyperParametersComponent,
            canDeactivate: [LeavingBeforeSaveAlertGuard],
            data     : {minimized: true},
            children: [
              {path: 'configuration/:configObject', component: ExperimentInfoTaskModelComponent},
              {path: 'hyper-param/:hyperParamId', component: ExperimentInfoHyperParametersFormContainerComponent}
            ]
          },
          {path: 'general', component: ExperimentInfoGeneralComponent, data: {minimized: true}},
          {
            path: 'info-output',
            component: ExperimentOutputComponent,
            data: {minimized: true},
            children: [
              {path: 'metrics/scalar', component: ExperimentOutputScalarsComponent, data: {minimized: true}},
              {path: 'metrics/plots', component: ExperimentOutputPlotsComponent, data: {minimized: true}},
              {path: 'debugImages', component: DebugImagesComponent, data: {minimized: true}},
              {path: 'log', component: ExperimentOutputLogComponent, data: {minimized: true}},
              {path: '', redirectTo: 'log', pathMatch: 'full'}
            ]
          }
        ]
      },
    ]
  },

  {
    path: ':experimentId/output',
    component: ExperimentOutputComponent,
    data: {search: false},
    children: [
      {path: '', redirectTo: 'execution'},
      {path: 'execution',
        component: ExperimentInfoExecutionComponent,
        canDeactivate: [LeavingBeforeSaveAlertGuard]
      },
      {
        path: 'hyper-params',
        component: ExperimentInfoHyperParametersComponent,
        data: {},
        canDeactivate: [LeavingBeforeSaveAlertGuard],
        children: [
          {path: 'configuration/:configObject', component: ExperimentInfoTaskModelComponent},
          {path: 'hyper-param/:hyperParamId', component: ExperimentInfoHyperParametersFormContainerComponent}
        ]
      },
      {
        path: 'artifacts',
        component: ExperimentInfoArtifactsComponent,
        data: {},
        canDeactivate: [LeavingBeforeSaveAlertGuard],
        children: [
          {path: '', redirectTo: 'input-model', pathMatch: 'full'},
          {path: 'input-model/:modelId', component: ExperimentInfoModelComponent , data: {outputModel: false}},
          {path: 'output-model/:modelId', component: ExperimentInfoModelComponent , data: {outputModel: true}},
          {path: 'artifact/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]},
          {path: 'other/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]}
        ]
      },
      {path: 'general', component: ExperimentInfoGeneralComponent, data: {}},
      {path: 'metrics/scalar', component: ExperimentOutputScalarsComponent, data: {}},
      {path: 'metrics/plots', component: ExperimentOutputPlotsComponent, data: {}},
      {path: 'debugImages', component: DebugImagesComponent},
      {path: 'log', component: ExperimentOutputLogComponent},
    ]
  }
];
