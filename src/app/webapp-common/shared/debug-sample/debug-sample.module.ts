import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {ClipboardModule} from 'ngx-clipboard';
import {MatSliderModule} from '@angular/material/slider';
import {ImageViewerComponent} from '@common/shared/debug-sample/image-viewer/image-viewer.component';
import {DebugImageSnippetComponent} from '@common/shared/debug-sample/debug-image-snippet/debug-image-snippet.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {SnippetErrorComponent} from '@common/shared/ui-components/indicators/snippet-error/snippet-error.component';
import {debugSampleReducer} from '@common/shared/debug-sample/debug-sample.reducer';
import {DebugSampleEffects} from '@common/shared/debug-sample/debug-sample.effects';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';



@NgModule({
  declarations: [ImageViewerComponent, DebugImageSnippetComponent],
  exports: [ImageViewerComponent, DebugImageSnippetComponent],
  imports: [
    CommonModule,
    ClipboardModule,
    MatSliderModule,
    TooltipDirective,
    StoreModule.forFeature('debugSample', debugSampleReducer),
    EffectsModule.forFeature([DebugSampleEffects]),
    SharedPipesModule,
    SnippetErrorComponent,
    ShowTooltipIfEllipsisDirective,
  ]
})
export class DebugSampleModule { }
