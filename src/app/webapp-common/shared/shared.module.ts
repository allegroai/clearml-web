import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CopyClipboardComponent } from './ui-components/indicators/copy-clipboard/copy-clipboard.component';
import { InlineEditComponent } from './ui-components/inputs/inline-edit/inline-edit.component';
import { SpinnerComponent } from './ui-components/overlay/spinner/spinner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { UiComponentsModule } from './ui-components/ui-components.module';
import { ChipsModule } from './ui-components/buttons/chips/chips.module';
import { ExperimentCardComponent } from './ui-components/panel/experiment-card/experiment-card.component';
import { ModelCardComponent } from './ui-components/panel/model-card/model-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  ExperimentInfoHeaderStatusProgressBarComponent
} from './experiment-info-header-status-progress-bar/experiment-info-header-status-progress-bar.component';
import {
  ExperimentInfoHeaderStatusIconLabelComponent
} from './experiment-info-header-status-icon-label/experiment-info-header-status-icon-label.component';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { SectionHeaderComponent } from './components/section-header/section-header.component';
import { LineChartComponent } from './components/charts/line-chart/line-chart.component';
import { DonutComponent } from './components/charts/donut/donut.component';
import { NgxJsonViewerComponent } from './components/ngx-json-viewer/ngx-json-viewer.component';
import { ExperimentRefreshComponent } from './components/experiment-refresh/experiment-refresh.component';
import { LeavingBeforeSaveAlertGuard } from './guards/leaving-before-save-alert.guard';
import { CustomColumnsListComponent } from './components/custom-columns-list/custom-columns-list.component';
import { BaseContextMenuComponent } from './components/base-context-menu/base-context-menu.component';
import { EntityFooterComponent } from './entity-page/entity-footer/entity-footer.component';
import { CheckPermissionDirective } from '~/shared/directives/check-permission.directive';
import { ScrollTextareaComponent } from './components/scroll-textarea/scroll-textarea.component';
import { ShowOnlyUserWorkComponent } from './components/show-only-user-work/show-only-user-work.component';
import { GeneralLeavingBeforeSaveAlertGuard } from './guards/general-leaving-before-save-alert.guard';
import { SortHumanizePipe } from './pipes/sort.pipe';
import { ScatterPlotComponent } from './components/charts/scatter-plot/scatter-plot.component';
import { ClearFiltersButtonComponent, } from './components/clear-filters-button/clear-filters-button.component';
import { MultiLineTooltipComponent } from './components/multi-line-tooltip/multi-line-tooltip.component';
import {
  ExperimentCompareGeneralDataComponent
} from '../experiments-compare/dumbs/experiment-compare-general-data/experiment-compare-general-data.component';
import { BaseEntityHeaderComponent } from './entity-page/base-entity-header/base-entity-header.component';
import { IdBadgeComponent } from './components/id-badge/id-badge.component';
import {
  SelectMetadataKeysCustomColsComponent
} from './components/select-metadata-keys-custom-cols/select-metadata-keys-custom-cols.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MainPagesHeaderFilterComponent } from './components/main-pages-header-filter/main-pages-header-filter.component';
import { MarkdownEditorComponent } from '@common/shared/components/markdown-editor/markdown-editor.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import {
  MarkdownCheatSheetDialogComponent
} from './components/markdown-editor/markdown-cheat-sheet-dialog/markdown-cheat-sheet-dialog.component';
import { SharedPipesModule } from '@common/shared/pipes/shared-pipes.module';
import {
  ExperimentStatusIconLabelComponent
} from '@common/shared/experiment-status-icon-label/experiment-status-icon-label.component';
import {
  ExperimentTypeIconLabelComponent
} from '@common/shared/experiment-type-icon-label/experiment-type-icon-label.component';
import { LabeledFormFieldDirective } from '@common/shared/directive/labeled-form-field.directive';

const _declarations = [
  ExperimentInfoHeaderStatusProgressBarComponent,
  ExperimentInfoHeaderStatusIconLabelComponent,
  ModelCardComponent,
  ExperimentCardComponent,
  SpinnerComponent,
  InlineEditComponent,
  CopyClipboardComponent,
  SectionHeaderComponent,
  LineChartComponent,
  DonutComponent,
  NgxJsonViewerComponent,
  ExperimentRefreshComponent,
  CustomColumnsListComponent,
  EntityFooterComponent,
  CheckPermissionDirective,
  ScrollTextareaComponent,
  SortHumanizePipe,
  ShowOnlyUserWorkComponent,
  SelectMetadataKeysCustomColsComponent,
  MultiLineTooltipComponent,
  ExperimentCompareGeneralDataComponent,
  MainPagesHeaderFilterComponent,
  MarkdownEditorComponent,
  ExperimentStatusIconLabelComponent,
  ExperimentTypeIconLabelComponent,
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    AvatarGroupModule,
    AvatarModule,
    ClipboardModule,
    UiComponentsModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    ChipsModule,
    ScrollingModule,
    LMarkdownEditorModule,
    SharedPipesModule,
    LabeledFormFieldDirective,
  ],
  declarations: [
    ..._declarations,
    BaseContextMenuComponent,
    ScatterPlotComponent,
    ClearFiltersButtonComponent,
    BaseEntityHeaderComponent,
    IdBadgeComponent,
    MarkdownCheatSheetDialogComponent,
  ],
  exports: [..._declarations, UiComponentsModule, TableModule, ClipboardModule,
    ScatterPlotComponent, ClearFiltersButtonComponent, IdBadgeComponent, AvatarGroupModule,
    AvatarModule,
  ],
  providers: [LeavingBeforeSaveAlertGuard, GeneralLeavingBeforeSaveAlertGuard]
})
export class SMSharedModule {
}
