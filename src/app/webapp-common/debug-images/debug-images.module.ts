import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {ExperimentCompareSharedModule} from '../experiments-compare/shared/experiment-compare-shared.module';
import {SMSharedModule} from '../shared/shared.module';
import {UiComponentsModule} from '../shared/ui-components/ui-components.module';
import {DebugImagesEffects} from './debug-images-effects';
import {debugSamplesReducer} from './debug-images-reducer';
import {DebugImagesViewComponent} from './debug-images-view/debug-images-view.component';
import {DebugImagesComponent} from './debug-images.component';
import {MatSliderModule} from '@angular/material/slider';
import {ExperimentGraphsModule} from '../shared/experiment-graphs/experiment-graphs.module';
import {DebugSampleModule} from '@common/shared/debug-sample/debug-sample.module';

const declarations = [DebugImagesComponent, DebugImagesViewComponent];

@NgModule({
  declarations,
  exports: declarations,
  imports: [
    UiComponentsModule,
    SMSharedModule,
    CommonModule,
    ExperimentCompareSharedModule,
    ScrollingModule,
    StoreModule.forFeature('debugImages', debugSamplesReducer),
    EffectsModule.forFeature([DebugImagesEffects]),
    MatSliderModule,
    ExperimentGraphsModule,
    DebugSampleModule
  ]
})
export class DebugImagesModule {
}
