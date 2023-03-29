import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SingleGraphComponent} from '@common/shared/single-graph/single-graph.component';
import {GraphViewerComponent} from '@common/shared/single-graph/graph-viewer/graph-viewer.component';
import {singleGraphReducer} from '@common/shared/single-graph/single-graph.reducer';
import { SingleGraphEffects } from './single-graph.effects';
import {MatLegacySliderModule as MatSliderModule} from '@angular/material/legacy-slider';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {FormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';



@NgModule({
  declarations: [SingleGraphComponent, GraphViewerComponent],
  exports: [SingleGraphComponent, GraphViewerComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('singleGraph', singleGraphReducer),
    EffectsModule.forFeature([SingleGraphEffects]),
    MatSliderModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    TooltipDirective,
  ]
})
export class SingleGraphModule { }
