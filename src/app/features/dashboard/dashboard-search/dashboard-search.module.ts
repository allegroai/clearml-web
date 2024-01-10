import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {DashboardSearchEffects as commonDashboardSearchEffects } from '@common/dashboard-search/dashboard-search.effects';
import {DashboardSearchEffects} from '~/features/dashboard/dashboard-search/dashboard-search.effects';
import {ProjectsSharedModule} from '../../projects/shared/projects-shared.module';
import {SharedModule} from '~/shared/shared.module';
import {dashboardSearchReducer} from '@common/dashboard-search/dashboard-search.reducer';
import {ReportsSharedModule} from '../../../webapp-common/reports/reports-shared.module';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ModelCardComponent} from '@common/shared/ui-components/panel/model-card/model-card.component';
import {ExperimentCardComponent} from '@common/shared/ui-components/panel/experiment-card/experiment-card.component';
import {CheckPermissionDirective} from '~/shared/directives/check-permission.directive';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {PipelineCardComponent} from '@common/pipelines/pipeline-card/pipeline-card.component';
import {VirtualGridComponent} from '@common/shared/components/virtual-grid/virtual-grid.component';

@NgModule({
  imports     : [
    CommonModule,
    ProjectsSharedModule,
    ReportsSharedModule,
    StoreModule.forFeature('search', dashboardSearchReducer),
    EffectsModule.forFeature([DashboardSearchEffects, commonDashboardSearchEffects]),
    SharedModule,
    ScrollingModule,
    ModelCardComponent,
    ExperimentCardComponent,
    CheckPermissionDirective,
    ProjectCardComponent,
    PipelineCardComponent,
    VirtualGridComponent
  ],
})
export class DashboardSearchModule {
}
