import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {ExperimentSharedModule} from '../experiments/shared/experiment-shared.module';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {StoreModule} from '@ngrx/store';
import {GettingStartedCardComponent} from './dumb/getting-started-card/getting-started-card.component';
import {SMSharedModule} from '@common/shared/shared.module';
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
import {ReportsSharedModule} from '../../webapp-common/reports/reports-shared.module';

@NgModule({
    imports: [
        CommonModule,
        ProjectsSharedModule,
        ProjectDialogModule,
        SMSharedModule,
        ExperimentSharedModule,
        DashboardRoutingModule,
        StoreModule.forFeature('dashboard', commonDashboardReducer),
        CommonDashboardModule,
        SharedModule,
        DashboardSearchModule,
        DatasetsSharedModule,
        ScrollingModule,
        ReportsSharedModule
    ],
  declarations   : [DashboardComponent, GettingStartedCardComponent, DashboardSearchBaseComponent, SearchResultsPageComponent]
})
export class DashboardModule {
}
