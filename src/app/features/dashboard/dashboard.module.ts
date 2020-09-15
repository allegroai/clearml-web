import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {ExperimentSharedModule} from '../experiments/shared/experiment-shared.module';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {StoreModule} from '@ngrx/store';
import {GettingStartedCardComponent} from './dumb/getting-started-card/getting-started-card.component';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {ProjectCreateDialogModule} from '../../webapp-common/shared/project-create-dialog/project-create-dialog.module';
import {CommonDashboardModule} from '../../webapp-common/dashboard/common-dashboard.module';
import {commonDashboardReducer} from '../../webapp-common/dashboard/common-dashboard.reducer';
import {CommonSearchResultsModule} from '../../webapp-common/search/common-search-results.module';
import {DashboardSearchComponent} from './containers/dashboard-search/dashboard-search.component';
import {SearchResultsPageComponent} from './dumb/search-results-page/search-results-page.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        ProjectCreateDialogModule,
        CommonModule,
        SMSharedModule,
        ExperimentSharedModule,
        DashboardRoutingModule,
        CommonSearchResultsModule,
        StoreModule.forFeature('dashboard', commonDashboardReducer),
        CommonDashboardModule,
        SharedModule,
    ],
  declarations   : [DashboardComponent, GettingStartedCardComponent, DashboardSearchComponent, SearchResultsPageComponent]
})
export class DashboardModule {
}
