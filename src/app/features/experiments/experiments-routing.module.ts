import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {routes as commonRoutes} from '../../webapp-common/experiments/experiment-routes';

export const routes: Routes = [
  ...commonRoutes
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class ExperimentRouterModule {
}

