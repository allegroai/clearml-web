import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PipelinesPageComponent} from "@common/pipelines/pipelines-page/pipelines-page.component";

const routes = [{
  path: '',
  component: PipelinesPageComponent,
  // canActivate: [RolePermissionsGuard],
  data: {search: true, features: FeaturesEnum.Pipelines},
  // children: [
  //   {
  //     path: ':projectId',
  //     children: [
  //       {
  //         path: 'experiments', loadChildren: () => import('@common/pipelines-controller/pipelines-controller.module').then(m => m.PipelinesControllerModule)
  //       },
  //       {
  //         path: 'compare-experiments',
  //         loadChildren: () => import('../experiments-compare/experiments-compare.module').then(m => m.ExperimentsCompareModule)
  //       },
  //     ]
  //   },
  // ]
}] as Routes;

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PipelinesRouterModule {
}

