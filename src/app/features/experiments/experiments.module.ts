import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentSharedModule} from './shared/experiment-shared.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {ExperimentRouterModule} from './experiments-routing.module';
import {AdminService} from '~/shared/services/admin.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectModelModule} from '@common/select-model/select-model.module';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {LayoutModule} from '~/layout/layout.module';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {AngularSplitModule} from 'angular-split';
import {SMMaterialModule} from '@common/shared/material/material.module';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {ExperimentInfoExecutionComponent} from '@common/experiments/containers/experiment-info-execution/experiment-info-execution.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {ExperimentOutputComponent} from './containers/experiment-ouptut/experiment-output.component';
import {ExperimentInfoNavbarComponent} from './containers/experiment-info-navbar/experiment-info-navbar.component';
import {ExperimentInfoHyperParametersComponent} from '@common/experiments/containers/experiment-info-hyper-parameters/experiment-info-hyper-parameters.component';
import {ExperimentInfoArtifactItemComponent} from '@common/experiments/containers/experiment-info-artifact-item/experiment-info-artifact-item.component';
import {ExperimentGeneralInfoComponent} from '@common/experiments/dumb/experiment-general-info/experiment-general-info.component';
import {ExperimentArtifactItemViewComponent} from '@common/experiments/dumb/experiment-artifact-item-view/experiment-artifact-item-view.component';
import {ExperimentHyperParamsNavbarComponent} from '@common/experiments/dumb/experiment-hyper-params-navbar/experiment-hyper-params-navbar.component';
import {ExperimentExecutionSourceCodeComponent} from '@common/experiments/dumb/experiment-execution-source-code/experiment-execution-source-code.component';
import {ExperimentInfoEditDescriptionComponent} from '@common/experiments/dumb/experiment-info-edit-description/experiment-info-edit-description.component';
import {ExperimentOutputModelViewComponent} from '@common/experiments/dumb/experiment-output-model-view/experiment-output-model-view.component';
import {ExperimentInfoGeneralComponent} from '@common/experiments/containers/experiment-info-general/experiment-info-general.component';
import {BaseClickableArtifactComponent} from '@common/experiments/dumb/base-clickable-artifact.component';
import {ExperimentModelsFormViewComponent} from '@common/experiments/dumb/experiment-models-form-view/experiment-models-form-view.component';
import {ExperimentArtifactsNavbarComponent} from '@common/experiments/dumb/experiment-artifacts-navbar/experiment-artifacts-navbar.component';
import {ExperimentInfoArtifactsComponent} from '@common/experiments/containers/experiment-info-aritfacts/experiment-info-artifacts.component';
import {ExperimentInfoHeaderComponent} from '@common/experiments/dumb/experiment-info-header/experiment-info-header.component';
import {ExperimentInfoTaskModelComponent} from '@common/experiments/containers/experiment-info-task-model/experiment-info-task-model.component';
import {ExperimentOutputScalarsComponent} from '@common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentInfoModelComponent} from '@common/experiments/containers/experiment-info-model/experiment-info-model.component';
import {ExperimentInfoHyperParametersFormContainerComponent} from '@common/experiments/containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {RouterModule} from '@angular/router';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonDeleteDialogModule} from '@common/shared/entity-page/entity-delete/common-delete-dialog.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {SharedModule} from '~/shared/shared.module';
import {MAT_AUTOCOMPLETE_SCROLL_STRATEGY} from '@angular/material/autocomplete';
import {scrollFactory} from '@common/shared/utils/scroll-factory';
import {Overlay} from '@angular/cdk/overlay';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {RouterTabNavBarComponent} from '@common/shared/components/router-tab-nav-bar/router-tab-nav-bar.component';
import {MatTabsModule} from '@angular/material/tabs';


@NgModule({
  imports: [
    SMMaterialModule,
    FormsModule,
    LayoutModule,
    ReactiveFormsModule,
    CommonModule,
    SMSharedModule,
    ExperimentRouterModule,
    ExperimentSharedModule,
    ExperimentGraphsModule,
    SelectModelModule,
    DebugImagesModule,
    ExperimentCompareSharedModule,
    CommonLayoutModule,
    MatSidenavModule,
    MatListModule,
    AngularSplitModule,
    SharedPipesModule,
    ScrollingModule,
    CommonDeleteDialogModule,
    SMSharedModule,
    RouterModule,
    SharedModule,
    ExperimentOutputLogModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    ExperimentSharedModule,
    RouterTabNavBarComponent,
    MatTabsModule,
    RouterTabNavBarComponent,
  ],
  declarations: [
    ExperimentsComponent,
    ExperimentInfoExecutionComponent,
    ExperimentOutputComponent,
    ExperimentInfoNavbarComponent,
    ExperimentInfoNavbarComponent,
    BaseClickableArtifactComponent,
    ExperimentInfoHeaderComponent,
    ExperimentInfoModelComponent,
    ExperimentInfoTaskModelComponent,
    ExperimentInfoGeneralComponent,
    ExperimentGeneralInfoComponent,
    ExperimentModelsFormViewComponent,
    ExperimentOutputModelViewComponent,
    ExperimentExecutionSourceCodeComponent,
    ExperimentOutputScalarsComponent,
    ExperimentInfoHyperParametersComponent,
    ExperimentInfoHyperParametersFormContainerComponent,
    ExperimentArtifactsNavbarComponent,
    ExperimentInfoArtifactsComponent,
    ExperimentHyperParamsNavbarComponent,
    ExperimentInfoArtifactItemComponent,
    ExperimentArtifactItemViewComponent,
    ExperimentInfoEditDescriptionComponent,
  ],
  exports: [
    ExperimentsComponent,
    ExperimentInfoHeaderComponent,
    ExperimentExecutionSourceCodeComponent,
  ],
  providers: [
    AdminService,
    SmSyncStateSelectorService,
    {provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay]},
  ]
})
export class ExperimentsModule {
}
