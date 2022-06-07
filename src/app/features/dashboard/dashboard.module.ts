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
import {DashboardSearchComponent} from './containers/dashboard-search/dashboard-search.component';
import {SearchResultsPageComponent} from './dumb/search-results-page/search-results-page.component';
import {SharedModule} from '~/shared/shared.module';
import {DashboardSearchModule} from './dashboard-search/dashboard-search.module';
import {ProjectDialogModule} from '@common/shared/project-dialog/project-dialog.module';
import {ProjectsSharedModule} from '../projects/shared/projects-shared.module';
import {SearchResultsComponent} from '@common/dashboard-search/dumb/search-results/search-results.component';

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
    DashboardSearchModule
  ],
  declarations   : [DashboardComponent, GettingStartedCardComponent, DashboardSearchComponent, SearchResultsPageComponent, SearchResultsComponent]
})
export class DashboardModule {
}
