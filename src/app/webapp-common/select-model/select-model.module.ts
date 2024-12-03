import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SelectModelComponent} from './select-model.component';
import {selectModelReducer} from './select-model.reducer';
import {SelectModelEffects} from './select-model.effects';
import {ModelSharedModule} from '../models/shared/model-shared.module';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {PushPipe} from '@ngrx/component';

@NgModule({
  imports: [
    CommonModule,
    ModelSharedModule,
    EffectsModule.forFeature([SelectModelEffects]),
    StoreModule.forFeature('selectModel', selectModelReducer),
    DialogTemplateComponent,
        PushPipe,
  ],
  providers: [],
  declarations: [SelectModelComponent],
  exports: [SelectModelComponent]
})
export class SelectModelModule {
}
