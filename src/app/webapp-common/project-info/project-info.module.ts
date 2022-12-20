import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectInfoComponent} from './project-info.component';
import {SMSharedModule} from '../shared/shared.module';
import {ProjectInfoRoutingModule} from './project-info-routing.module';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {FormsModule} from '@angular/forms';
import {CommonLayoutModule} from '../layout/layout.module';
import { ProjectStatsComponent } from './conteiners/project-stats/project-stats.component';
import {ExperimentsCommonModule} from '../experiments/common-experiments.module';
import {MetricForStatsDialogComponent} from './conteiners/metric-for-stats-dialog/metric-for-stats-dialog.component';

@NgModule({
  declarations: [ProjectInfoComponent, ProjectStatsComponent, MetricForStatsDialogComponent],
  imports: [
    CommonModule,
    SMSharedModule,
    FormsModule,
    ProjectInfoRoutingModule,
    LMarkdownEditorModule,
    CommonLayoutModule,
    ExperimentsCommonModule,
  ]
})
export class ProjectInfoModule {
}
