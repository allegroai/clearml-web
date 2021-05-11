import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {SelectableListComponent} from '../../webapp-common/shared/ui-components/data/selectable-list/selectable-list.component';
import {SelectableFilterListComponent} from '../../webapp-common/shared/ui-components/data/selectable-filter-list/selectable-filter-list.component';
import {routes as commonRoutes} from '../../webapp-common/experiments/experiment-routes';

export const routes: Routes = [
  ...commonRoutes
];

@NgModule({
  imports: [
    SMSharedModule,
    RouterModule.forChild(routes),

  ],
  exports: [RouterModule, SelectableListComponent, SelectableFilterListComponent]
})
export class ExperimentRouterModule {
}

