import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '@common/shared/shared.module';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {ProjectCardMenuExtendedComponent} from '~/features/projects/containers/project-card-menu-extended/project-card-menu-extended.component';
import {ProjectCardMenuComponent} from '@common/shared/ui-components/panel/project-card-menu/project-card-menu.component';

const _declarations = [
  ProjectCardComponent,
  ProjectCardMenuComponent,
  ProjectCardMenuExtendedComponent
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
