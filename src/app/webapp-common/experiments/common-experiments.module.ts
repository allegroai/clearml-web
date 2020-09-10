import {NgModule} from '@angular/core';
import {CommonModule, TitleCasePipe} from '@angular/common';
import {ExperimentTypeIconLabelComponent} from './dumb/experiment-type-icon-label/experiment-type-icon-label.component';
import {SharedPipesModule} from '../shared/pipes/shared-pipes.module';
import {EffectsModule} from '@ngrx/effects';
import {CommonExperimentsViewEffects} from './effects/common-experiments-view.effects';
import {CommonExperimentsInfoEffects} from './effects/common-experiments-info.effects';
import {CommonExperimentOutputEffects} from './effects/common-experiment-output.effects';
import {CommonExperimentsMenuEffects} from './effects/common-experiments-menu.effects';
import {ExperimentHeaderComponent} from './dumb/experiment-header/experiment-header.component';
import {ExperimentInfoHeaderComponent} from './dumb/experiment-info-header/experiment-info-header.component';
import {ExperimentsTableComponent} from './dumb/experiments-table/experiments-table.component';
import {ExperimentOutputComponent} from './containers/experiment-ouptut/experiment-output.component';
import {ExperimentOutputLogComponent} from './containers/experiment-output-log/experiment-output-log.component';
import {ExperimentLogInfoComponent} from './dumb/experiment-log-info/experiment-log-info.component';
import {ExperimentInfoGeneralComponent} from './containers/experiment-info-general/experiment-info-general.component';
import {ExperimentGeneralInfoComponent} from './dumb/experiment-general-info/experiment-general-info.component';
import {ExperimentInputModelFormComponent} from './dumb/experiment-input-model-form/experiment-input-model-form.component';
import {ExperimentNetworkDesignFormComponent} from './dumb/experiment-network-design-form/experiment-network-design-form.component';
import {ExperimentModelsFormViewComponent} from './dumb/experiment-models-form-view/experiment-models-form-view.component';
import {ExperimentExecutionFormComponent} from './dumb/experiment-execution-form/experiment-execution-form.component';
import {ExperimentExecutionSourceCodeComponent} from './dumb/experiment-execution-source-code/experiment-execution-source-code.component';
import {ExperimentExecutionParametersComponent} from './dumb/experiment-execution-parameters/experiment-execution-parameters.component';
import {ExperimentExecutionOutputComponent} from './dumb/experiment-execution-output/experiment-execution-output.component';
import {ExperimentOutputPlotsComponent} from './containers/experiment-output-plots/experiment-output-plots.component';
import {ExperimentOutputScalarsComponent} from './containers/experiment-output-scalars/experiment-output-scalars.component';
import {ModelAutoPopulateDialogComponent} from './dumb/model-auto-populate-dialog/model-auto-populate-dialog.component';
import {ExperimentTableCardComponent} from './dumb/experiment-table-card/experiment-table-card.component';
import {SMSharedModule} from '../shared/shared.module';
import {CommonLayoutModule} from '../layout/layout.module';
import {ExperimentSharedModule} from '../../features/experiments/shared/experiment-shared.module';
import {CommonExperimentSharedModule} from './shared/common-experiment-shared.module';
import {RouterModule} from '@angular/router';
import {SMMaterialModule} from '../shared/material/material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExperimentGraphsModule} from '../shared/experiment-graphs/experiment-graphs.module';
import {CommonExperimentsComponent} from './common-experiments.component';
import {AngularSplitModule} from 'angular-split';
import {ExperimentCompareSharedModule} from '../experiments-compare/shared/experiment-compare-shared.module';
import {ExperimentCustomColsMenuComponent} from './dumb/experiment-custom-cols-menu/experiment-custom-cols-menu.component';
import {SelectMetricForCustomColComponent} from './dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {ExperimentInfoHyperParametersComponent} from './containers/experiment-info-hyper-parameters/experiment-info-hyper-parameters.component';
import {ExperimentExecutionDiffComponent} from './dumb/experiment-execution-diff/experiment-execution-diff.component';
import {ExperimentExecutionRequirementsComponent} from './dumb/experiment-execution-requirements/experiment-execution-requirements.component';
import {SelectHyperParamsForCustomColComponent} from './dumb/select-hyper-params-for-custom-col/select-hyper-params-for-custom-col.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ExperimentArtifactsNavbarComponent} from './dumb/experiment-artifacts-navbar/experiment-artifacts-navbar.component';
import {ExperimentOutputModelViewComponent} from './dumb/experiment-output-model-view/experiment-output-model-view.component';
import {ExperimentInfoArtifactsComponent} from './containers/experiment-info-aritfacts/experiment-info-artifacts.component';
import {ExperimentOutputModelFormComponent} from './dumb/experiment-output-model-form/experiment-output-model-form.component';
import {ExperimentInfoOutputModelComponent} from './containers/experiment-info-output-model/experiment-info-output-model.component';
import {ExperimentInfoArtifactItemComponent} from './containers/experiment-info-artifact-item/experiment-info-artifact-item.component';
import {ExperimentArtifactItemViewComponent} from './dumb/experiment-artifact-item-view/experiment-artifact-item-view.component';
import {ExperimentInfoInputModelComponent} from './containers/experiment-info-input-model/experiment-info-input-model.component';
import {ExperimentOrchestrationFormComponent} from './dumb/experiment-orchestration-form/experiment-orchestration-form.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {BaseClickableArtifact} from './dumb/base-clickable-artifact';
import {BaseExperimentMenuComponent} from './shared/components/base-experiment-menu';
import {NoUnderscorePipe} from '../shared/pipes/no-underscore.pipe';
import {ExperimentHyperParamsNavbarComponent} from './dumb/experiment-hyper-params-navbar/experiment-hyper-params-navbar.component';
import {ExperimentInfoTaskModelComponent} from './containers/experiment-info-task-model/experiment-info-task-model.component';
import {ExperimentInfoHyperParametersFormContainerComponent} from './containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component';
import {ExperimentTaskModelFormComponent} from './dumb/experiment-task-model-form/experiment-task-model-form.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations   : [
    SelectMetricForCustomColComponent,
    SelectHyperParamsForCustomColComponent,
    CommonExperimentsComponent,
    BaseClickableArtifact,
    ExperimentTypeIconLabelComponent,
    ExperimentHeaderComponent,
    ExperimentInfoHeaderComponent,
    ExperimentsTableComponent,
    ExperimentInfoInputModelComponent,
    ExperimentInfoTaskModelComponent,
    ExperimentOutputComponent,
    ExperimentOutputLogComponent,
    ExperimentLogInfoComponent,
    ExperimentInfoGeneralComponent,
    ExperimentGeneralInfoComponent,
    ExperimentInputModelFormComponent,
    ExperimentTaskModelFormComponent,
    ExperimentNetworkDesignFormComponent,
    ExperimentModelsFormViewComponent,
    ExperimentOutputModelViewComponent,
    ExperimentExecutionFormComponent,
    ExperimentExecutionSourceCodeComponent,
    ExperimentExecutionParametersComponent,
    ExperimentExecutionOutputComponent,
    ExperimentOutputPlotsComponent,
    ExperimentOutputScalarsComponent,
    ModelAutoPopulateDialogComponent,
    ExperimentCustomColsMenuComponent,
    ExperimentTableCardComponent,
    ExperimentInfoHyperParametersComponent,
    ExperimentInfoHyperParametersFormContainerComponent,
    ExperimentExecutionDiffComponent,
    ExperimentExecutionRequirementsComponent,
    ExperimentArtifactsNavbarComponent,
    ExperimentInfoArtifactsComponent,
    ExperimentHyperParamsNavbarComponent,
    ExperimentOutputModelFormComponent,
    ExperimentInfoOutputModelComponent,
    ExperimentInfoArtifactItemComponent,
    ExperimentArtifactItemViewComponent,
    ExperimentOrchestrationFormComponent,
    BaseExperimentMenuComponent
  ],
  exports        : [ExperimentTypeIconLabelComponent, CommonExperimentsComponent, ExperimentInfoHeaderComponent, ExperimentExecutionFormComponent],
    imports: [
        AngularSplitModule.forRoot(),
        ScrollingModule,
        ExperimentGraphsModule,
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
        EffectsModule.forFeature([CommonExperimentsViewEffects, CommonExperimentsInfoEffects, CommonExperimentOutputEffects, CommonExperimentsMenuEffects]),
        MatProgressSpinnerModule,
        SharedModule,
    ],
  providers      : [ExperimentTableCardComponent, NoUnderscorePipe, TitleCasePipe]
})
export class ExperimentsCommonModule {
}
