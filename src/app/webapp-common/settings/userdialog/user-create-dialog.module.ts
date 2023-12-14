import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { userCreateDialogReducer } from './user-create-dialog.reducer';
import { UserCreateDialogEffects } from './user-create-dialog.effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserCreateDialogComponent } from './user-create-dialog.component';
import { CreateNewUserFormComponent } from './create-user-form/create-new-user-form.component';
import { CreateNewGroupFormComponent } from './create-group-form/create-new-group-form.component';
import { CreateNewCompanyFormComponent } from './create-company-form/create-new-company-form.component';
import { UiComponentsModule } from '../../shared/ui-components/ui-components.module';
import { SMMaterialModule } from '../../shared/material/material.module';
import { LabeledFormFieldDirective } from '@common/shared/directive/labeled-form-field.directive';

@NgModule({
  imports: [
    UiComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMMaterialModule,
    StoreModule.forFeature('userCreateDialog', userCreateDialogReducer),
    EffectsModule.forFeature([UserCreateDialogEffects]),
    LabeledFormFieldDirective,
  ],
  declarations: [UserCreateDialogComponent, CreateNewUserFormComponent, CreateNewGroupFormComponent, CreateNewCompanyFormComponent]
})
export class UserCreateDialogModule {
}
