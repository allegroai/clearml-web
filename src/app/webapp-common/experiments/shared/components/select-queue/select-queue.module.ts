import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {SelectQueueComponent} from './select-queue.component';
import {SelectQueueEffects} from './select-queue.effects';
import {selectQueueReducer} from './select-queue.reducer';
import {SMSharedModule} from '@common/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SMSharedModule,
    EffectsModule.forFeature([SelectQueueEffects]),
    StoreModule.forFeature('selectQueue', selectQueueReducer),
    FormsModule,
    ReactiveFormsModule
  ],
  providers      : [],
  declarations   : [SelectQueueComponent],
  exports        : [SelectQueueComponent]
})
export class SelectQueueModule {
}
