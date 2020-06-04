import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '../../../webapp-common/shared/shared.module';
import {ProjectCardComponent} from '../dumb/project-card/project-card.component';

const _declarations = [
  ProjectCardComponent
];

@NgModule({
  imports        : [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMSharedModule
  ],
  declarations   : [..._declarations],
  exports        : [..._declarations]
})
export class ProjectsSharedModule {
}
