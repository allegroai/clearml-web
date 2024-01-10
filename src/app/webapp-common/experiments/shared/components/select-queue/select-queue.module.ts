import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {SelectQueueComponent} from './select-queue.component';
import {SelectQueueEffects} from './select-queue.effects';
import {selectQueueReducer} from './select-queue.reducer';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {StringIncludedInArrayPipe} from '@common/shared/pipes/string-included-in-array.pipe';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([SelectQueueEffects]),
    StoreModule.forFeature('selectQueue', selectQueueReducer),
    FormsModule,
    ReactiveFormsModule,
    LabeledFormFieldDirective,
    StringIncludedInArrayPipe,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    DialogTemplateComponent,
    TooltipDirective,
  ],
  providers      : [],
  declarations   : [SelectQueueComponent],
  exports        : [SelectQueueComponent]
})
export class SelectQueueModule {
}
