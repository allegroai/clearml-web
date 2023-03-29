import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  NestedProjectViewPageExtendedComponent
} from '~/features/nested-project-view/nested-project-view-page-extended/nested-project-view-page-extended.component';

const routes = [{
  path: '',
  component: NestedProjectViewPageExtendedComponent,
  data: {search: true},
}] as Routes;

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class NestedProjectViewRouterModule {
}

