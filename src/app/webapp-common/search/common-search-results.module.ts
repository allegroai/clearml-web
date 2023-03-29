import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {CommonSearchResultsEffects} from './common-search-results.effects';
import {ProjectsSearchResultsComponent} from './dumb/projects-search-results/projects-search-results.component';
import {commonSearchResultsReducer} from './common-search-results.reducer';
import {ExperimentsSearchResultsComponent} from './dumb/experiments-search-results/experiments-search-results.component';
import {ModelsSearchResultsComponent} from './dumb/models-search-results/models-search-results.component';
import {ProjectsSharedModule} from '../../features/projects/shared/projects-shared.module';
import {CommonProjectsModule} from '../projects/common-projects.module';

const _declarations = [
  ModelsSearchResultsComponent,
  ProjectsSearchResultsComponent,
  ExperimentsSearchResultsComponent,
];

@NgModule({
  imports     : [
    ProjectsSharedModule,
    CommonModule,
    SMSharedModule,
    StoreModule.forFeature('search', commonSearchResultsReducer),
    CommonProjectsModule,
    EffectsModule.forFeature([CommonSearchResultsEffects])
  ],
  declarations: [_declarations],
  exports     : [..._declarations]
})
export class CommonSearchResultsModule {
}
