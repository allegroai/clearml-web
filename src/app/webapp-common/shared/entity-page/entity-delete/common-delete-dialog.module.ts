import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {commonDeleteDialogReducer} from './common-delete-dialog.reducer';
import {CommonDeleteDialogComponent} from './common-delete-dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {DeleteDialogEffects} from '~/features/delete-entity/delete-dialog.effects';
import {FormsModule} from '@angular/forms';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {PushPipe} from '@ngrx/component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';


@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('deleteEntityDialog', commonDeleteDialogReducer),
    EffectsModule.forFeature([DeleteDialogEffects]),
    MatProgressBarModule,
    FormsModule,
    CopyClipboardComponent,
    DialogTemplateComponent,
    MatCheckboxModule,
    PushPipe,
    SaferPipe,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective,
    MatButton,
    MatIcon,
  ],
  declarations: [CommonDeleteDialogComponent]
})
export class CommonDeleteDialogModule { }
