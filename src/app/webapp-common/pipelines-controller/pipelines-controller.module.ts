import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControllersComponent} from './controllers.component';
import {AngularSplitModule} from 'angular-split';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {CommonDeleteDialogModule} from '@common/shared/entity-page/entity-delete/common-delete-dialog.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {RouterModule, Routes} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {MatRadioModule} from '@angular/material/radio';
import {PipelineControllerInfoComponent} from './pipeline-controller-info/pipeline-controller-info.component';
import {PipelineControllerStepComponent} from './pipeline-controller-step/pipeline-controller-step.component';
import { PipelineInfoComponent } from './pipeline-details/pipeline-info.component';
import {PipelineControllerMenuComponent} from '@common/pipelines-controller/pipeline-controller-menu/pipeline-controller-menu.component';
import {RunPipelineControllerDialogComponent} from './run-pipeline-controller-dialog/run-pipeline-controller-dialog.component';
import {AbortControllerDialogComponent} from '@common/pipelines-controller/pipeline-controller-menu/abort-controller-dialog/abort-controller-dialog.component';
import {
    SimpleDatasetVersionPreviewComponent
} from '@common/dataset-version/simple-dataset-version-preview/simple-dataset-version-preview.component';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {DurationPipe} from '@common/shared/pipes/duration.pipe';
import {MenuItemTextPipe} from '@common/shared/pipes/menu-item-text.pipe';
import {FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {RegexPipe} from '@common/shared/pipes/filter-regex.pipe';
import {FilterMonitorMetricPipe} from '@common/shared/pipes/filter-monitor-metric.pipe';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {EntityFooterComponent} from '@common/shared/entity-page/entity-footer/entity-footer.component';
import {
  ExperimentTypeIconLabelComponent
} from '@common/shared/experiment-type-icon-label/experiment-type-icon-label.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {IdBadgeComponent} from '@common/shared/components/id-badge/id-badge.component';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {OverlayComponent} from '@common/shared/ui-components/overlay/overlay/overlay.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {SelectQueueModule} from '@common/experiments/shared/components/select-queue/select-queue.module';

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
    FormsModule,
    ReactiveFormsModule,
    ExperimentCompareSharedModule,
    ExperimentSharedModule,
    RouterModule,
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    ExperimentOutputLogModule,
    MatRadioModule,
    SimpleDatasetVersionPreviewComponent,
    LabeledFormFieldDirective,
    SearchTextDirective,
    FilterPipe,
    DurationPipe,
    MenuItemTextPipe,
    FileSizePipe,
    RegexPipe,
    FilterMonitorMetricPipe,
    TagsMenuComponent,
    EntityFooterComponent,
    ExperimentTypeIconLabelComponent,
    TooltipDirective,
    DialogTemplateComponent,
    IdBadgeComponent,
    ButtonToggleComponent,
    OverlayComponent,
    MatAutocompleteModule,
    MatInputModule,
    MatExpansionModule,
    MatMenuModule,
    ShowTooltipIfEllipsisDirective,
    SelectQueueModule,
  ],
  providers: [
    ControllersComponent,
  ]
})
export class PipelinesControllerModule { }
