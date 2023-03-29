import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {ReportComponent} from '@common/reports/report/report.component';
import {
  NestedProjectViewPageComponent
} from "@common/nested-project-view/nested-project-view-page/nested-project-view-page.component";

export const routes: Routes = [
  {
    path: '', component: ReportsPageComponent, data: {search: true}
  },
  // Adding project param to url, for automatic workspace switching.
  {
    path: ':projectId',
    children: [
      {path: 'reports', component: ReportsPageComponent, data: {search: true}},
      {path: 'projects', component: NestedProjectViewPageComponent, data: {search: true}},
      {path: ':reportId', component: ReportComponent, data: {search: true}}
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
