import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardProjectsComponent} from './containers/dashboard-projects/dashboard-projects.component';
import {SMSharedModule} from '../shared/shared.module';
import {DashboardExperimentsComponent} from './containers/dashboard-experiments/dashboard-experiments.component';
import {RecentExperimentTableComponent} from './dumb/recent-experiment-table/recent-experiment-table.component';
import {ExperimentSharedModule} from '../../features/experiments/shared/experiment-shared.module';
import {ExperimentsCommonModule} from '../experiments/common-experiments.module';
import {CommonDashboardEffects} from './common-dashboard.effects';
import {CommonSearchModule} from '../common-search/common-search.module';
import {CommonLayoutModule} from '../layout/layout.module';
import {EffectsModule} from '@ngrx/effects';
import {ProjectsSharedModule} from '../../features/projects/shared/projects-shared.module';
import {CommonExperimentSharedModule} from '../experiments/shared/common-experiment-shared.module';
import {CommonProjectsModule} from '../projects/common-projects.module';
import {SharedModule} from '../../shared/shared.module';
import { WelcomeMessageComponent } from './dumb/welcome-message/welcome-message.component';

@NgModule({
  declarations: [DashboardProjectsComponent, DashboardExperimentsComponent, RecentExperimentTableComponent, WelcomeMessageComponent],
  exports     : [DashboardProjectsComponent, DashboardExperimentsComponent],
  imports: [
    CommonModule,
    SMSharedModule,
    ExperimentsCommonModule,
    ExperimentSharedModule,
    CommonSearchModule,
    ProjectsSharedModule,
    CommonExperimentSharedModule,
    EffectsModule.forFeature([CommonDashboardEffects]),
    CommonLayoutModule,
    ExperimentSharedModule,
    CommonProjectsModule,
    SharedModule
  ]
})
export class CommonDashboardModule {
}
