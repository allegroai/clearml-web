import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonProjectsPageComponent} from './containers/projects-page/common-projects-page.component';
import {EffectsModule} from '@ngrx/effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProjectsListComponent} from './dumb/projects-list/projects-list.component';
import {ProjectDialogModule} from '../shared/project-dialog/project-dialog.module';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {ProjectsEffects} from '~/features/projects/projects.effect';
import {CommonProjectsEffects} from './common-projects.effects';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectDialogModule,
    ProjectsSharedModule,
    EffectsModule.forFeature([ProjectsEffects, CommonProjectsEffects]),
    LabeledFormFieldDirective,
    ProjectCardComponent,
  ],
  declarations: [CommonProjectsPageComponent, ProjectsListComponent],
  exports: [CommonProjectsPageComponent, ProjectsListComponent]
})
export class CommonProjectsModule {
}
