import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '@common/shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {DashboardSearchEffects} from '@common/dashboard-search/dashboard-search.effects';
import {ProjectsSharedModule} from '../../projects/shared/projects-shared.module';
import {SharedModule} from '~/shared/shared.module';
import {dashboardSearchReducer} from '@common/dashboard-search/dashboard-search.reducer';

@NgModule({
  imports     : [
    CommonModule,
    SMSharedModule,
    ProjectsSharedModule,
    StoreModule.forFeature('search', dashboardSearchReducer),
    EffectsModule.forFeature([DashboardSearchEffects]),
    SharedModule
  ],
})
export class DashboardSearchModule {
}
