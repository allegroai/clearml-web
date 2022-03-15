import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PipelinesPageComponent} from './pipelines-page/pipelines-page.component';
import {PipelineCardComponent} from './pipeline-card/pipeline-card.component';
import {UiComponentsModule} from '@common/shared/ui-components/ui-components.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {PipelineCardMenuComponent} from './pipeline-card-menu/pipeline-card-menu.component';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {StoreModule} from '@ngrx/store';
import {projectsReducer} from '~/features/projects/projects.reducer';
import {RouterModule, Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', component: PipelinesPageComponent }
];


@NgModule({
  declarations: [
    PipelinesPageComponent,
    PipelineCardComponent,
    PipelineCardMenuComponent,
  ],
  imports: [
    CommonModule,
    UiComponentsModule,
    SMSharedModule,
    CommonProjectsModule,
    StoreModule.forFeature('projects', projectsReducer),
    RouterModule.forChild(routes)
  ]
})
export class PipelinesModule { }
