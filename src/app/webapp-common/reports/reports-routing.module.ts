import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {ReportComponent} from '@common/reports/report/report.component';

export const routes: Routes = [
  {
    path: '', component: ReportsPageComponent, data: {search: true}
  },
  // Adding project param to url, for automatic workspace switching.
  {path: ':project/:reportId', component: ReportComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
