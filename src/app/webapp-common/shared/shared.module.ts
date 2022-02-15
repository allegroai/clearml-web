import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CopyClipboardComponent} from './ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {InlineEditComponent} from './ui-components/inputs/inline-edit/inline-edit.component';
import {SpinnerComponent} from './ui-components/overlay/spinner/spinner.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ClipboardModule} from 'ngx-clipboard';
import {UiComponentsModule} from './ui-components/ui-components.module';
import {ChipsModule} from './ui-components/buttons/chips/chips.module';
import {SharedPipesModule} from './pipes/shared-pipes.module';
import {ExperimentCardComponent} from './ui-components/panel/experiment-card/experiment-card.component';
import {ModelCardComponent} from './ui-components/panel/model-card/model-card.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {ExperimentInfoHeaderStatusProgressBarComponent} from './experiment-info-header-status-progress-bar/experiment-info-header-status-progress-bar.component';
import {ExperimentInfoHeaderStatusIconLabelComponent} from './experiment-info-header-status-icon-label/experiment-info-header-status-icon-label.component';
import {TableModule} from 'primeng/table';
import {SectionHeaderComponent} from './components/section-header/section-header.component';
import {LineChartComponent} from './components/charts/line-chart/line-chart.component';
import {DonutComponent} from './components/charts/donut/donut.component';
import {NgxFilesizeModule} from 'ngx-filesize';
import {NgxJsonViewerComponent} from './components/ngx-json-viewer/ngx-json-viewer.component';
import {ExperimentRefreshComponent} from './components/experiment-refresh/experiment-refresh.component';
import {LeavingBeforeSaveAlertGuard} from './guards/leaving-before-save-alert.guard';
import {CustomColumnsListComponent} from './components/custom-columns-list/custom-columns-list.component';
import { BaseContextMenuComponent } from './components/base-context-menu/base-context-menu.component';
import {EntityFooterComponent} from './entity-page/entity-footer/entity-footer.component';
import {CheckPermissionDirective} from '../../shared/directives/check-permission.directive';
import {ScrollTextareaComponent} from './components/scroll-textarea/scroll-textarea.component';
import { ShowOnlyUserWorkComponent } from './components/show-only-user-work/show-only-user-work.component';
import {GeneralLeavingBeforeSaveAlertGuard} from './guards/general-leaving-before-save-alert.guard';
import {SortHumanizePipe} from './pipes/sort.pipe';
import { ScatterPlotComponent } from './components/charts/scatter-plot/scatter-plot.component';
import {
  ClearFiltersButtonComponent,
} from './components/clear-filters-button/clear-filters-button.component';
import { AppendComponentOnTopElementDirective } from './directive/append-component-on-top-element.directive';
import {MultiLineTooltipComponent} from './components/multi-line-tooltip/multi-line-tooltip.component';

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
  AppendComponentOnTopElementDirective,
  MultiLineTooltipComponent,
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ClipboardModule,
    UiComponentsModule,
    SharedPipesModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    NgxFilesizeModule,
    ChipsModule
  ],
  declarations: [
    _declarations,
    BaseContextMenuComponent,
    ScatterPlotComponent,
    ClearFiltersButtonComponent,
  ],
    exports: [..._declarations, UiComponentsModule, TableModule, ClipboardModule, SharedPipesModule, MatSnackBarModule,
        NgxFilesizeModule, ScatterPlotComponent, ClearFiltersButtonComponent
    ],
  providers   : [LeavingBeforeSaveAlertGuard, GeneralLeavingBeforeSaveAlertGuard]
})
export class SMSharedModule {
}
