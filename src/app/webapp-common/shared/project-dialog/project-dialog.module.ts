import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SMMaterialModule} from '../material/material.module';
import {projectDialogReducer} from './project-dialog.reducer';
import {ProjectDialogEffects} from './project-dialog.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiComponentsModule} from '../ui-components/ui-components.module';
import {ProjectDialogComponent} from './project-dialog.component';
import {CreateNewProjectFormComponent} from './create-new-project-form/create-new-project-form.component';
import {SharedPipesModule} from '../pipes/shared-pipes.module';
import {ProjectMoveToFormComponent} from './project-move-to-form/project-move-to-form.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {UniqueProjectValidator} from '@common/shared/project-dialog/unique-project.validator';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';

@NgModule({
  imports: [
    UiComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMMaterialModule,
    StoreModule.forFeature('projectCreateDialog', projectDialogReducer),
    EffectsModule.forFeature([ProjectDialogEffects]),
    SharedPipesModule,
    MatProgressSpinnerModule,
    LabeledFormFieldDirective
  ],
  declarations: [ProjectDialogComponent, CreateNewProjectFormComponent, ProjectMoveToFormComponent, UniqueProjectValidator]
})
export class ProjectDialogModule { }
