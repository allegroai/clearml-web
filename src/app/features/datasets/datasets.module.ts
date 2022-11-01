import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '@common/shared/shared.module';
import {ChipsModule} from '@common/shared/ui-components/buttons/chips/chips.module';
import {SimpleDatasetsComponent} from '@common/datasets/simple-datasets/simple-datasets.component';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {ExperimentsCommonModule} from '@common/experiments/common-experiments.module';
import {CommonExperimentSharedModule} from '@common/experiments/shared/common-experiment-shared.module';
import {
  SimpleDatasetVersionsComponent
} from '@common/datasets/simple-dataset-versions/simple-dataset-versions.component';
import {AngularSplitModule} from 'angular-split';
import {
  SimpleDatasetVersionMenuComponent
} from '@common/datasets/simple-dataset-version-menu/simple-dataset-version-menu.component';
import {
  SimpleDatasetVersionInfoComponent
} from '@common/datasets/simple-dataset-version-info/simple-dataset-version-info.component';
import {PipelinesControllerModule} from '@common/pipelines-controller/pipelines-controller.module';
import {DatasetsRoutingModule} from '~/features/datasets/datasets-routing.module';
import {DatasetVersionStepComponent} from '@common/datasets/dataset-version-step/dataset-version-step.component';
import {DatasetsSharedModule} from '~/features/datasets/shared/datasets-shared.module';
import {SimpleDatasetVersionDetailsComponent} from '@common/datasets/simple-dataset-version-details/simple-dataset-version-details.component';
import {SimpleDatasetVersionContentComponent} from '@common/datasets/simple-dataset-version-content/simple-dataset-version-content.component';
import {SimpleDatasetVersionPreviewComponent} from '@common/datasets/simple-dataset-version-preview/simple-dataset-version-preview.component';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SMSharedModule,
    ChipsModule,
    FormsModule,
    AngularSplitModule,
    CommonProjectsModule,
    ProjectsSharedModule,
    CommonExperimentSharedModule,
    ExperimentSharedModule,
    DatasetsRoutingModule,
    ExperimentsCommonModule,
    ExperimentCompareSharedModule,
    PipelinesControllerModule,
    DatasetsSharedModule,
    ExperimentOutputLogModule,
    DebugImagesModule,
  ],
  declarations: [
    SimpleDatasetsComponent,
    SimpleDatasetVersionsComponent,
    SimpleDatasetVersionMenuComponent,
    SimpleDatasetVersionInfoComponent,
    SimpleDatasetVersionContentComponent,
    SimpleDatasetVersionPreviewComponent,
    DatasetVersionStepComponent,
    SimpleDatasetVersionDetailsComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  exports: []
})
export class DatasetsModule {
}

