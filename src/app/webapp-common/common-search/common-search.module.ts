import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonSearchComponent} from './containers/common-search/common-search.component';
import {StoreModule} from '@ngrx/store';
import {searchReducer} from './common-search.reducer';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {PushPipe} from '@ngrx/component';


@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('commonSearch', searchReducer),
    ClickStopPropagationDirective,
    SearchComponent,
    TooltipDirective,
    PushPipe,
  ],
  declarations: [CommonSearchComponent],
  exports     : [CommonSearchComponent]
})
export class CommonSearchModule {
}
