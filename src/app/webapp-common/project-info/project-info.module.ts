import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectInfoComponent} from './project-info.component';
import {ProjectInfoRoutingModule} from './project-info-routing.module';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {FormsModule} from '@angular/forms';
import {CommonLayoutModule} from '../layout/layout.module';
import { ProjectStatsComponent } from './conteiners/project-stats/project-stats.component';
import {MetricForStatsDialogComponent} from './conteiners/metric-for-stats-dialog/metric-for-stats-dialog.component';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {ScatterPlotComponent} from '@common/shared/components/charts/scatter-plot/scatter-plot.component';
import {MarkdownEditorComponent} from '@common/shared/components/markdown-editor/markdown-editor.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';

@NgModule({
  declarations: [ProjectInfoComponent, ProjectStatsComponent, MetricForStatsDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProjectInfoRoutingModule,
    LMarkdownEditorModule,
    CommonLayoutModule,
    ExperimentCompareSharedModule,
    ScatterPlotComponent,
    MarkdownEditorComponent,
    MatExpansionModule,
    TooltipDirective,
    DialogTemplateComponent,
  ]
})
export class ProjectInfoModule {
}
