import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SMMaterialModule} from '../../material/material.module';
import {commonDeleteDialogReducer} from './common-delete-dialog.reducer';
import {UiComponentsModule} from '../../ui-components/ui-components.module';
import {CommonDeleteDialogComponent} from './common-delete-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {SMSharedModule} from '../../shared.module';
import {DeleteDialogEffects} from '~/features/delete-entity/delete-dialog.effects';
import {FormsModule} from '@angular/forms';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';

@NgModule({
    imports: [
        UiComponentsModule,
        CommonModule,
        SMMaterialModule,
        StoreModule.forFeature('deleteEntityDialog', commonDeleteDialogReducer),
        EffectsModule.forFeature([DeleteDialogEffects]),
        MatProgressBarModule,
        SMSharedModule,
        FormsModule,
      LabeledFormFieldDirective,
    ],
  declarations: [CommonDeleteDialogComponent]
})
export class CommonDeleteDialogModule { }
