import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '@common/shared/shared.module';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {ProjectCardMenuExtendedComponent} from '~/features/projects/containers/project-card-menu-extended/project-card-menu-extended.component';
import {ProjectCardMenuComponent} from '@common/shared/ui-components/panel/project-card-menu/project-card-menu.component';
import {PipelineCardComponent} from '@common/pipelines/pipeline-card/pipeline-card.component';
import {PipelineCardMenuComponent} from '@common/pipelines/pipeline-card-menu/pipeline-card-menu.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {DatasetEmptyComponent} from '@common/datasets/dataset-empty/dataset-empty.component';
import {NestedCardComponent} from '@common/nested-project-view/nested-card/nested-card.component';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {PipelinesEmptyStateComponent} from '@common/pipelines/pipelines-page/pipelines-empty-state/pipelines-empty-state.component';

const _declarations = [
  ProjectCardComponent,
  ProjectCardMenuComponent,
  ProjectCardMenuExtendedComponent,
  PipelineCardComponent,
  PipelineCardMenuComponent,
  NestedCardComponent,
  DatasetEmptyComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMSharedModule,
    ScrollingModule,
    SharedPipesModule
  ],
  declarations: [..._declarations, PipelinesEmptyStateComponent],
  exports: [..._declarations, PipelinesEmptyStateComponent]
})
export class ProjectsSharedModule {
}
