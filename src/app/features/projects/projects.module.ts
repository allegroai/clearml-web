import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {ProjectRouterModule} from '../projects/projects-routing.module';
import {EffectsModule} from '@ngrx/effects';
import {projectsReducer} from '../projects/projects.reducer';
import {ProjectsEffects} from './projects.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProjectCreateDialogModule} from '../../webapp-common/shared/project-create-dialog/project-create-dialog.module';
import {ProjectCreateDialogComponent} from '../../webapp-common/shared/project-create-dialog/project-create-dialog.component';
import {CommonProjectsModule} from '../../webapp-common/projects/common-projects.module';

@NgModule({
  imports        : [
    CommonModule,
    SMSharedModule,
    ProjectRouterModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectCreateDialogModule,
    CommonProjectsModule,
    StoreModule.forFeature('projects', projectsReducer),
    EffectsModule.forFeature([ProjectsEffects]),
  ],
  declarations   : []
})
export class ProjectsModule {
}
