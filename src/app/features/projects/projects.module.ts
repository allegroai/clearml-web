import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {ProjectRouterModule} from './projects-routing.module';
import {projectsReducer} from './projects.reducer';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonProjectsModule} from '../../webapp-common/projects/common-projects.module';

export const projectSyncedKeys = ['showHidden'];

@NgModule({
  imports        : [
    CommonModule,
    SMSharedModule,
    ProjectRouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonProjectsModule,
    StoreModule.forFeature('projects', projectsReducer),
  ],
  declarations   : []
})
export class ProjectsModule {
}
