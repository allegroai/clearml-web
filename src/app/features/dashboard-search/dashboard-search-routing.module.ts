import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {DashboardSearchComponent} from '~/features/dashboard-search/containers/dashboard-search/dashboard-search.component';

const staticBreadcrumb = [[{
  name: 'GLOBAL SEARCH',
  type: CrumbTypeEnum.Feature
}]];

export const routes: Routes = [
  {path: '', component: DashboardSearchComponent, data: {staticBreadcrumb}},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DashboardSearchRoutingModule {
}
