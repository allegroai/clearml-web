import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CrumbTypeEnum, IBreadcrumbsLink} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {ServingComponent} from '@common/serving/serving.component';
import {ServingInfoComponent} from '@common/serving/serving-info/serving-info.component';
import {ServingGeneralInfoComponent} from '@common/serving/serving-general-info/serving-general-info.component';
import {ServingMonitorComponent} from '@common/serving/serving-monitor/serving-monitor.component';
import {ServingLoadingComponent} from '@common/serving/serving-loading.component';

export const routes: Routes = [
  {
    path: '',
    data: {
      staticBreadcrumb: [[{
        name: 'MODEL ENDPOINTS',
        type: CrumbTypeEnum.Feature
      } as IBreadcrumbsLink]]
    },
    children: [
      {
        path: 'active', component: ServingComponent,
        children: [
          {
            path: ':endpointId', component: ServingInfoComponent,
            children: [
              {path: '', redirectTo: 'general', pathMatch: 'full', data: {minimized: true}},
              {path: 'general', component: ServingGeneralInfoComponent, data: {
                minimized: true,
                  staticBreadcrumb: [[{
                    name: 'MODEL ENDPOINTS',
                    type: CrumbTypeEnum.Feature
                  } as IBreadcrumbsLink]]}
              },
              {path: 'monitor', component: ServingMonitorComponent, data: {
                minimized: true,
                  staticBreadcrumb: [[{
                    name: 'MODEL ENDPOINTS',
                    type: CrumbTypeEnum.Feature
                  } as IBreadcrumbsLink]]}
              }
            ]
          }
        ]
      },
      {
        path: 'loading', component: ServingLoadingComponent,
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ServingRouterModule {
}

