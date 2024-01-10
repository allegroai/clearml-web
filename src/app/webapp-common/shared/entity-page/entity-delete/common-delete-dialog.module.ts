import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {commonDeleteDialogReducer} from './common-delete-dialog.reducer';
import {CommonDeleteDialogComponent} from './common-delete-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {DeleteDialogEffects} from '~/features/delete-entity/delete-dialog.effects';
import {FormsModule} from '@angular/forms';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('deleteEntityDialog', commonDeleteDialogReducer),
    EffectsModule.forFeature([DeleteDialogEffects]),
    MatProgressBarModule,
    FormsModule,
    LabeledFormFieldDirective,
    CopyClipboardComponent,
    DialogTemplateComponent,
    MatCheckboxModule,
  ],
  declarations: [CommonDeleteDialogComponent]
})
export class CommonDeleteDialogModule { }
