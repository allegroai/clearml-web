import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SMMaterialModule} from '../material/material.module';
import {projectCreateDialogReducer} from './project-create-dialog.reducer';
import {ProjectCreateDialogEffects} from './project-create-dialog.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiComponentsModule} from '../ui-components/ui-components.module';
import {ProjectCreateDialogComponent} from './project-create-dialog.component';
import {CreateNewProjectFormComponent} from './create-new-project-form/create-new-project-form.component';

@NgModule({
  imports: [
    UiComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMMaterialModule,
    StoreModule.forFeature('projectCreateDialog', projectCreateDialogReducer),
    EffectsModule.forFeature([ProjectCreateDialogEffects])
  ],
  declarations: [ProjectCreateDialogComponent, CreateNewProjectFormComponent]
})
export class ProjectCreateDialogModule { }
