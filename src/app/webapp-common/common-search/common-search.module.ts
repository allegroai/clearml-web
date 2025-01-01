import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {searchReducer} from './common-search.reducer';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {PushPipe} from '@ngrx/component';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';


@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('commonSearch', searchReducer),
    ClickStopPropagationDirective,
    SearchComponent,
    TooltipDirective,
    PushPipe,
    MatIcon,
    MatIconButton
  ]
})
export class CommonSearchModule {
}
