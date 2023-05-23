import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';

export const routes: Routes = [
  {path: '', component: DashboardComponent, data:{staticBreadcrumb:[[{
        name: 'DASHBOARD',
        type: CrumbTypeEnum.Feature
      }]]}
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
