import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectRouterModule} from './projects-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonProjectsModule} from '@common/projects/common-projects.module';

export const projectSyncedKeys = ['showHidden', 'tableModeAwareness', 'orderBy', 'sortOrder'];

@NgModule({
  imports        : [
    CommonModule,
    ProjectRouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonProjectsModule,
  ],
  declarations   : []
})
export class ProjectsModule {
}
