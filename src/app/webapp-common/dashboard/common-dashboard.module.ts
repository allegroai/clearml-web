import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardProjectsComponent} from './containers/dashboard-projects/dashboard-projects.component';
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
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {PlusCardComponent} from '@common/shared/ui-components/panel/plus-card/plus-card.component';
import {StatusIconLabelComponent} from '@common/shared/experiment-status-icon-label/status-icon-label.component';
import {
  ExperimentTypeIconLabelComponent
} from '@common/shared/experiment-type-icon-label/experiment-type-icon-label.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {OverflowsDirective} from '@common/shared/ui-components/directives/overflows.directive';
import {TableModule} from 'primeng/table';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@NgModule({
  declarations: [DashboardProjectsComponent, DashboardExperimentsComponent, RecentExperimentTableComponent],
  exports: [DashboardProjectsComponent, DashboardExperimentsComponent],
  imports: [
    CommonModule,
    CommonSearchModule,
    ProjectsSharedModule,
    EffectsModule.forFeature([CommonDashboardEffects]),
    CommonLayoutModule,
    CommonProjectsModule,
    SharedModule,
    FormsModule,
    ExperimentCompareSharedModule,
    ProjectCardComponent,
    PlusCardComponent,
    StatusIconLabelComponent,
    ExperimentTypeIconLabelComponent,
    TooltipDirective,
    TableComponent,
    OverflowsDirective,
    TableModule,
    ShowTooltipIfEllipsisDirective
  ]
})
export class CommonDashboardModule {
}
