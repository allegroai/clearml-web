import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../../webapp-common/shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {DashboardSearchEffects} from '../../../webapp-common/dashboard-search/dashboard-search.effects';
import {ExperimentsSearchResultsComponent} from '../../../webapp-common/dashboard-search/dumb/experiments-search-results/experiments-search-results.component';
import {ModelsSearchResultsComponent} from '../../../webapp-common/dashboard-search/dumb/models-search-results/models-search-results.component';
import {ProjectsSearchResultsComponent} from '../../../webapp-common/dashboard-search/dumb/projects-search-results/projects-search-results.component';
import {ProjectsSharedModule} from '../../projects/shared/projects-shared.module';
import {SharedModule} from '../../../shared/shared.module';
import {dashboardSearchReducer} from '../../../webapp-common/dashboard-search/dashboard-search.reducer';

const declarations = [
  ModelsSearchResultsComponent,
  ProjectsSearchResultsComponent,
  ExperimentsSearchResultsComponent,
];

@NgModule({
  imports     : [
    CommonModule,
    SMSharedModule,
    ProjectsSharedModule,
    StoreModule.forFeature('search', dashboardSearchReducer),
    EffectsModule.forFeature([DashboardSearchEffects]),
    SharedModule
  ],
  declarations: [declarations],
  exports     : [...declarations]
})
export class DashboardSearchModule {
}
