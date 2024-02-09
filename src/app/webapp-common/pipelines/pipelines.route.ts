import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PipelinesPageComponent} from '@common/pipelines/pipelines-page/pipelines-page.component';
import { EditPipelineComponent} from '@common/pipelines/edit-pipeline/edit-pipeline.component';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';

const routes = [  {
    path: '',
    component: PipelinesPageComponent,
    data: {
      search: true,
      features: FeaturesEnum.Pipelines,
      staticBreadcrumb: [[{
        name: 'PIPELINES',
        type: CrumbTypeEnum.Feature
      }]]
    },
    
    
  },{ path: ':id/edit', component: EditPipelineComponent }] as Routes;

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PipelinesRouterModule {
}

