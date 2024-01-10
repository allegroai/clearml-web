import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '~/shared/shared.module';
import {ReportCardComponent} from '@common/reports/report-card/report-card.component';
import {ReportCardMenuComponent} from '@common/reports/report-card-menu/report-card-menu.component';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {CleanProjectPathPipe} from '@common/shared/pipes/clean-project-path.pipe';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {StatusIconLabelComponent} from '@common/shared/experiment-status-icon-label/status-icon-label.component';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {MatMenuModule} from '@angular/material/menu';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

const declarations = [  ReportCardComponent,
  ReportCardMenuComponent,];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ExperimentSharedModule,
    LabeledFormFieldDirective,
    TimeAgoPipe,
    CleanProjectPathPipe,
    CardComponent,
    InlineEditComponent,
    TagsMenuComponent,
    StatusIconLabelComponent,
    TagListComponent,
    TooltipDirective,
    MatMenuModule,
    ClickStopPropagationDirective,
    ShowTooltipIfEllipsisDirective
  ],
  declarations: [...declarations],
  exports: [...declarations],
  providers: []
})

export class ReportsSharedModule {
}
