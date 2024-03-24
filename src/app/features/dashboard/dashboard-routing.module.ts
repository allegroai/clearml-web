import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';

const staticBreadcrumb = [[{
        name: 'DASHBOARD',
        type: CrumbTypeEnum.Feature
}]];

export const routes: Routes = [
  {path: '', component: DashboardComponent, data: {staticBreadcrumb}},
  {
    path: 'search',
    loadChildren: () => import('~/features/dashboard-search/dashboard-search.module').then(m => m.DashboardSearchModule),
    data: {staticBreadcrumb}}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
