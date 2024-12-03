import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {ExperimentCompareSharedModule} from '../experiments-compare/shared/experiment-compare-shared.module';
import {DebugImagesEffects} from './debug-images-effects';
import {debugSamplesReducer} from './debug-images-reducer';
import {DebugImagesViewComponent} from './debug-images-view/debug-images-view.component';
import {DebugImagesComponent} from './debug-images.component';
import {MatSliderModule} from '@angular/material/slider';
import {ExperimentGraphsModule} from '../shared/experiment-graphs/experiment-graphs.module';
import {DebugSampleModule} from '@common/shared/debug-sample/debug-sample.module';
import {ItemByIdPipe} from '@common/shared/pipes/item-by-id.pipe';
import {
  ExperimentCompareGeneralDataComponent
} from '@common/experiments-compare/dumbs/experiment-compare-general-data/experiment-compare-general-data.component';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {VirtualGridComponent} from '@common/shared/components/virtual-grid/virtual-grid.component';
import {PushPipe} from '@ngrx/component';


const declarations = [DebugImagesComponent, DebugImagesViewComponent];

@NgModule({
  declarations,
  exports: declarations,
  imports: [
    CommonModule,
    ExperimentCompareSharedModule,
    ScrollingModule,
    StoreModule.forFeature('debugImages', debugSamplesReducer),
    EffectsModule.forFeature([DebugImagesEffects]),
    MatSliderModule,
    ExperimentGraphsModule,
    DebugSampleModule,
    ItemByIdPipe,
    ExperimentCompareGeneralDataComponent,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    TooltipDirective,
    VirtualGridComponent,
    PushPipe,
  ]
})
export class DebugImagesModule {
}
