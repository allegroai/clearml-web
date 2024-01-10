import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {ExperimentSharedModule} from '../experiments/shared/experiment-shared.module';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {StoreModule} from '@ngrx/store';
import {GettingStartedCardComponent} from './dumb/getting-started-card/getting-started-card.component';
import {CommonDashboardModule} from '@common/dashboard/common-dashboard.module';
import {commonDashboardReducer} from '@common/dashboard/common-dashboard.reducer';
import {SearchResultsPageComponent} from './dumb/search-results-page/search-results-page.component';
import {SharedModule} from '~/shared/shared.module';
import {DashboardSearchModule} from './dashboard-search/dashboard-search.module';
import {ProjectDialogModule} from '@common/shared/project-dialog/project-dialog.module';
import {ProjectsSharedModule} from '../projects/shared/projects-shared.module';
import {DashboardSearchBaseComponent} from '@common/dashboard/dashboard-search.component.base';
import {DatasetsSharedModule} from '~/features/datasets/shared/datasets-shared.module';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CheckPermissionDirective} from '~/shared/directives/check-permission.directive';
import {PlusCardComponent} from '@common/shared/ui-components/panel/plus-card/plus-card.component';
import {NeonButtonComponent} from '@common/shared/ui-components/buttons/neon-button/neon-button.component';
import {OverflowsDirective} from '@common/shared/ui-components/directives/overflows.directive';
import {ReportsSharedModule} from '@common/reports/reports-shared.module';
import {PipelineCardComponent} from '@common/pipelines/pipeline-card/pipeline-card.component';
import {ModelCardComponent} from '@common/shared/ui-components/panel/model-card/model-card.component';
import {ExperimentCardComponent} from '@common/shared/ui-components/panel/experiment-card/experiment-card.component';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {VirtualGridComponent} from '@common/shared/components/virtual-grid/virtual-grid.component';

@NgModule({
  imports: [
    CommonModule,
    ProjectsSharedModule,
    ProjectDialogModule,
    ExperimentSharedModule,
    DashboardRoutingModule,
    StoreModule.forFeature('dashboard', commonDashboardReducer),
    CommonDashboardModule,
    SharedModule,
    DashboardSearchModule,
    DatasetsSharedModule,
    ScrollingModule,
    CheckPermissionDirective,
    PlusCardComponent,
    NeonButtonComponent,
    OverflowsDirective,
    ReportsSharedModule,
    PipelineCardComponent,
    ModelCardComponent,
    ExperimentCardComponent,
    ProjectCardComponent,
    VirtualGridComponent
  ],
  declarations   : [DashboardComponent, GettingStartedCardComponent, DashboardSearchBaseComponent, SearchResultsPageComponent]
})
export class DashboardModule {
}
