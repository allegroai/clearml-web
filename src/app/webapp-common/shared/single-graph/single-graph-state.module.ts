import { NgModule } from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {singleGraphReducer} from '@common/shared/single-graph/single-graph.reducer';
import { SingleGraphEffects } from './single-graph.effects';


@NgModule({
  imports: [
    StoreModule.forFeature('singleGraph', singleGraphReducer),
    EffectsModule.forFeature([SingleGraphEffects]),
  ]
})
export class SingleGraphStateModule { }
