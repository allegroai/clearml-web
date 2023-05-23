import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {
  SimpleDatasetVersionsComponent
} from '@common/dataset-version/simple-dataset-versions/simple-dataset-versions.component';
import {
  SimpleDatasetVersionInfoComponent
} from '@common/dataset-version/simple-dataset-version-info/simple-dataset-version-info.component';
import {
  SimpleDatasetVersionMenuComponent
} from '@common/dataset-version/simple-dataset-version-menu/simple-dataset-version-menu.component';
import {
  SimpleDatasetVersionDetailsComponent
} from '@common/dataset-version/simple-dataset-version-details/simple-dataset-version-details.component';
import {
  SimpleDatasetVersionContentComponent
} from '@common/dataset-version/simple-dataset-version-content/simple-dataset-version-content.component';
import {
  SimpleDatasetVersionPreviewComponent
} from '@common/dataset-version/simple-dataset-version-preview/simple-dataset-version-preview.component';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {AngularSplitModule} from 'angular-split';
import {DatasetVersionStepComponent} from '@common/dataset-version/dataset-version-step/dataset-version-step.component';



export const routes: Routes = [
  {
    path: '',
    component: SimpleDatasetVersionsComponent,
    children: [
      {
        path: ':versionId', component: SimpleDatasetVersionInfoComponent,
      },
    ]
  }
];


@NgModule({
  declarations: [
    SimpleDatasetVersionsComponent,
    SimpleDatasetVersionMenuComponent,
    SimpleDatasetVersionInfoComponent,
    SimpleDatasetVersionDetailsComponent,
    SimpleDatasetVersionContentComponent,
    DatasetVersionStepComponent,
  ],
  imports: [
    SimpleDatasetVersionPreviewComponent,
    CommonModule,
    SMSharedModule,
    AngularSplitModule,
    SharedPipesModule,
    ExperimentSharedModule,
    ExperimentCompareSharedModule,
    ExperimentOutputLogModule,
    DebugImagesModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    SimpleDatasetVersionPreviewComponent,
  ]
})
export class DatasetVersionModule { }
