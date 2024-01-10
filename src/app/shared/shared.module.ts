import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {IsEmptyPipe} from '@common/shared/pipes/is-empty.pipe';
import {FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {ChipsComponent} from '@common/shared/ui-components/buttons/chips/chips.component';
import {MatMenuModule} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NumberCounterComponent} from '@common/shared/ui-components/indicators/number-counter/number-counter.component';
import {ClickPreventDefaultDirective} from '@common/shared/ui-components/directives/click-prevent-default.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@NgModule({
  declarations: [],
  exports     : [],
  imports     : [
    CommonModule,
    MatProgressSpinnerModule,
    TimeAgoPipe,
    IsEmptyPipe,
    FileSizePipe,
    CopyClipboardComponent,
    CircleCounterComponent,
    CardComponent,
    InlineEditComponent,
    TagsMenuComponent,
    ClickStopPropagationDirective,
    TagListComponent,
    ChipsComponent,
    MatMenuModule,
    TooltipDirective,
    NumberCounterComponent,
    ClickPreventDefaultDirective,
    ShowTooltipIfEllipsisDirective
  ],
})
export class SharedModule {
}
