import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '~/shared/shared.module';
import {SimpleDatasetCardComponent} from '@common/datasets/simple-dataset-card/simple-dataset-card.component';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {ShortProjectNamePipe} from '@common/shared/pipes/short-project-name.pipe';
import {CleanProjectPathPipe} from '@common/shared/pipes/clean-project-path.pipe';
import {NAPipe} from '@common/shared/pipes/na.pipe';
import {FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

const _declerations = [
SimpleDatasetCardComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ProjectsSharedModule,
    ClickStopPropagationDirective,
    TagListComponent,
    CircleCounterComponent,
    TimeAgoPipe,
    CardComponent,
    InlineEditComponent,
    ShortProjectNamePipe,
    CleanProjectPathPipe,
    NAPipe,
    FileSizePipe,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective
  ],
  declarations: [..._declerations],
  exports     : [..._declerations]
})

export class DatasetsSharedModule { }
