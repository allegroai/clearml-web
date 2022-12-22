import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '@common/shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {DashboardSearchEffects as commonDashboardSearchEffects } from '@common/dashboard-search/dashboard-search.effects';
import {DashboardSearchEffects} from '~/features/dashboard/dashboard-search/dashboard-search.effects';
import {ProjectsSharedModule} from '../../projects/shared/projects-shared.module';
import {SharedModule} from '~/shared/shared.module';
import {dashboardSearchReducer} from '@common/dashboard-search/dashboard-search.reducer';
import {ReportsSharedModule} from '../../../webapp-common/reports/reports-shared.module';

@NgModule({
  imports     : [
    CommonModule,
    SMSharedModule,
    ProjectsSharedModule,
    ReportsSharedModule,
    StoreModule.forFeature('search', dashboardSearchReducer),
    EffectsModule.forFeature([DashboardSearchEffects, commonDashboardSearchEffects]),
    SharedModule
  ],
})
export class DashboardSearchModule {
}
