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

@NgModule({
  declarations: [ProjectInfoComponent, ProjectStatsComponent],
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
