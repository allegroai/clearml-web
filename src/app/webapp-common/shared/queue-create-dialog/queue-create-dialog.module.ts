import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {queueCreateDialogReducer} from './queue-create-dialog.reducer';
import {QueueCreateDialogEffects} from './queue-create-dialog.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {QueueCreateDialogComponent} from './queue-create-dialog.component';
import {CreateNewQueueFormComponent} from './create-new-queue-form/create-new-queue-form.component';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {
  UniqueNameValidatorDirective
} from '@common/shared/ui-components/template-forms-ui/unique-name-validator.directive';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forFeature('queueCreateDialog', queueCreateDialogReducer),
    EffectsModule.forFeature([QueueCreateDialogEffects]),
    LabeledFormFieldDirective,
    UniqueNameValidatorDirective,
    DialogTemplateComponent,
    MatInputModule,
  ],
  declarations   : [QueueCreateDialogComponent, CreateNewQueueFormComponent]
})
export class QueueCreateDialogModule {
}
