import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardProjectsComponent} from './containers/dashboard-projects/dashboard-projects.component';
import {SMSharedModule} from '../shared/shared.module';
import {DashboardExperimentsComponent} from './containers/dashboard-experiments/dashboard-experiments.component';
import {RecentExperimentTableComponent} from './dumb/recent-experiment-table/recent-experiment-table.component';
import {CommonDashboardEffects} from './common-dashboard.effects';
import {CommonSearchModule} from '../common-search/common-search.module';
import {CommonLayoutModule} from '../layout/layout.module';
import {EffectsModule} from '@ngrx/effects';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {CommonProjectsModule} from '../projects/common-projects.module';
import {SharedModule} from '~/shared/shared.module';
import {FormsModule} from '@angular/forms';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';

@NgModule({
  declarations: [DashboardProjectsComponent, DashboardExperimentsComponent, RecentExperimentTableComponent],
  exports: [DashboardProjectsComponent, DashboardExperimentsComponent],
  imports: [
    CommonModule,
    SMSharedModule,
    CommonSearchModule,
    ProjectsSharedModule,
    EffectsModule.forFeature([CommonDashboardEffects]),
    CommonLayoutModule,
    CommonProjectsModule,
    SharedModule,
    FormsModule,
    ExperimentCompareSharedModule
  ]
})
export class CommonDashboardModule {
}
