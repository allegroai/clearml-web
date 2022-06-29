import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControllersComponent} from './controllers.component';
import {AngularSplitModule} from 'angular-split';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {CommonDeleteDialogModule} from '@common/shared/entity-page/entity-delete/common-delete-dialog.module';
import {SMMaterialModule} from '@common/shared/material/material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {CommonExperimentSharedModule} from '@common/experiments/shared/common-experiment-shared.module';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {RouterModule, Routes} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {SharedModule} from '~/shared/shared.module';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {MatRadioModule} from '@angular/material/radio';
import {ExperimentsCommonModule} from '@common/experiments/common-experiments.module';
import {PipelineControllerInfoComponent} from './pipeline-controller-info/pipeline-controller-info.component';
import {PipelineControllerStepComponent} from './pipeline-controller-step/pipeline-controller-step.component';
import { PipelineInfoComponent } from './pipeline-details/pipeline-info.component';
import {PipelineControllerMenuComponent} from '@common/pipelines-controller/pipeline-controller-menu/pipeline-controller-menu.component';
import {RunPipelineControllerDialogComponent} from './run-pipeline-controller-dialog/run-pipeline-controller-dialog.component';
import {AbortControllerDialogComponent} from '@common/pipelines-controller/pipeline-controller-menu/abort-controller-dialog/abort-controller-dialog.component';

export const routes: Routes = [
  {
    path: '',
    component: ControllersComponent,
    children: [
      {
        path: ':controllerId', component: PipelineControllerInfoComponent,
      },
    ]
  }
];


@NgModule({
  declarations: [
    ControllersComponent,
    PipelineControllerInfoComponent,
    PipelineControllerStepComponent,
    PipelineInfoComponent,
    PipelineControllerMenuComponent,
    RunPipelineControllerDialogComponent,
    AbortControllerDialogComponent
  ],
  exports: [
    PipelineControllerStepComponent
  ],
  imports: [
    AngularSplitModule,
    ScrollingModule,
    ExperimentGraphsModule,
    CommonDeleteDialogModule,
    SMMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ExperimentCompareSharedModule,
    CommonExperimentSharedModule,
    CommonLayoutModule,
    ExperimentSharedModule,
    SMSharedModule,
    SharedPipesModule,
    RouterModule,
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    SharedModule,
    ExperimentOutputLogModule,
    MatRadioModule,
    ExperimentsCommonModule,
  ],
  providers: [ControllersComponent]
})
export class PipelinesControllerModule { }
