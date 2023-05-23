import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {ReportComponent} from '@common/reports/report/report.component';
import {
  NestedProjectViewPageComponent
} from '@common/nested-project-view/nested-project-view-page/nested-project-view-page.component';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';

export const routes: Routes = [
  {
    path: '', component: ReportsPageComponent, data: {search: true, staticBreadcrumb:[[{
          name: 'REPORTS',
          type: CrumbTypeEnum.Feature
        }]]}
  },
  // Adding project param to url, for automatic workspace switching.
  {
    path: ':projectId',
    children: [
      {path: 'reports', component: ReportsPageComponent, data: {search: true}},
      {path: 'projects', component: NestedProjectViewPageComponent, data: {search: true}},
      {path: ':reportId', component: ReportComponent}
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
