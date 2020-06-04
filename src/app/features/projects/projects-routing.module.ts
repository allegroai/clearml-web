import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonProjectsPageComponent} from '../../webapp-common/projects/containers/projects-page/common-projects-page.component';

export const routes: Routes = [
  {path: '', component: CommonProjectsPageComponent}
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ProjectRouterModule {
}

