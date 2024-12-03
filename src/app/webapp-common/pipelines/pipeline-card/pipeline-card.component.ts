import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TIME_FORMAT_STRING} from '@common/constants';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {ProjectCardComponent} from '@common/shared/ui-components/panel/project-card/project-card.component';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {BreadcrumbsEllipsisPipe} from '@common/shared/pipes/breadcrumbs-ellipsis.pipe';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {ShortProjectNamePipe} from '@common/shared/pipes/short-project-name.pipe';
import {CleanProjectPathPipe} from '@common/shared/pipes/clean-project-path.pipe';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {DatePipe, NgIf} from '@angular/common';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@Component({
  selector: 'sm-pipeline-card',
  templateUrl: './pipeline-card.component.html',
  styleUrls: ['./pipeline-card.component.scss'],
  standalone: true,
  imports: [
    CircleCounterComponent,
    CardComponent,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    TooltipDirective,
    BreadcrumbsEllipsisPipe,
    CdkFixedSizeVirtualScroll,
    InlineEditComponent,
    ShortProjectNamePipe,
    CleanProjectPathPipe,
    ProjectsSharedModule,
    DatePipe,
    TimeAgoPipe,
    TagListComponent,
    NgIf,
    ClickStopPropagationDirective,
    ShowTooltipIfEllipsisDirective,
    SaferPipe
  ]
})
export class PipelineCardComponent extends ProjectCardComponent {
  @Input() allTags: string[];
  @Output() run = new EventEmitter();
  @Output() addTag = new EventEmitter<string>();
  @Output() removeTag = new EventEmitter<string>();
  @Output() delete = new EventEmitter();
  protected readonly TIME_FORMAT_STRING = TIME_FORMAT_STRING;
  timeFormatString = TIME_FORMAT_STRING;
}
