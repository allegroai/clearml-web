import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonProjectsPageComponent} from './containers/projects-page/common-projects-page.component';
import {SMSharedModule} from '../shared/shared.module';
import {EffectsModule} from '@ngrx/effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProjectsListComponent} from './dumb/projects-list/projects-list.component';
import {ProjectDialogModule} from '../shared/project-dialog/project-dialog.module';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {CommonLayoutModule} from '../layout/layout.module';
import {SharedModule} from '~/shared/shared.module';
import {ProjectsEffects} from '~/features/projects/projects.effect';
import {CommonProjectsEffects} from './common-projects.effects';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';

@NgModule({
  imports: [
    CommonModule,
    SMSharedModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectDialogModule,
    ProjectsSharedModule,
    EffectsModule.forFeature([ProjectsEffects, CommonProjectsEffects]),
    SharedModule,
    CommonLayoutModule,
    LabeledFormFieldDirective,
  ],
  declarations: [CommonProjectsPageComponent, ProjectsListComponent],
  exports: [CommonProjectsPageComponent, ProjectsListComponent]
})
export class CommonProjectsModule {
}
