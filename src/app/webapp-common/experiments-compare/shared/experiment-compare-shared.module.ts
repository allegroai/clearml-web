import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentSettingsComponent} from '../../shared/components/experiment-settings/experiment-settings';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AdvancedFilterPipe} from '@common/shared/pipes/advanced-filter.pipe';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {MatExpansionModule} from '@angular/material/expansion';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {IsEmptyPipe} from '@common/shared/pipes/is-empty.pipe';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';


const declarations = [
  ExperimentSettingsComponent,
];

@NgModule({
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatProgressSpinnerModule,
    AdvancedFilterPipe,
    SearchComponent,
    ClickStopPropagationDirective,
    MatExpansionModule,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective,
    IsEmptyPipe,
    MatSlideToggle,
    MatIconButton,
    MatIcon,
  ],
  declarations   : [declarations],
  exports        : [...declarations]
})
export class ExperimentCompareSharedModule {
}
