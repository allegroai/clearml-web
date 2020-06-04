import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {queueCreateDialogReducer} from './queue-create-dialog.reducer';
import {QueueCreateDialogEffects} from './queue-create-dialog.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {QueueCreateDialogComponent} from './queue-create-dialog.component';
import {CreateNewQueueFormComponent} from './create-new-queue-form/create-new-queue-form.component';
import {UiComponentsModule} from '../ui-components/ui-components.module';
import {SMMaterialModule} from '../material/material.module';

@NgModule({
  imports        : [
    UiComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMMaterialModule,
    StoreModule.forFeature('queueCreateDialog', queueCreateDialogReducer),
    EffectsModule.forFeature([QueueCreateDialogEffects])
  ],
  declarations   : [QueueCreateDialogComponent, CreateNewQueueFormComponent]
})
export class QueueCreateDialogModule {
}
