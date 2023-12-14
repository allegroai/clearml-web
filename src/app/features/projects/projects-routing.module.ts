import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonProjectsPageComponent } from '@common/projects/containers/projects-page/common-projects-page.component';
import { CrumbTypeEnum } from '@common/layout/breadcrumbs/breadcrumbs.component';

export const routes: Routes = [
  {
    path: '',
    component: CommonProjectsPageComponent,
    data: {
      staticBreadcrumb: [[{
        name: 'Projects',
        type: CrumbTypeEnum.Feature
      }]]
    }
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ProjectRouterModule { }
