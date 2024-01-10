import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {Project} from '~/business-logic/model/projects/project';
import {ICONS} from '@common/constants';
import {trackById} from '@common/shared/utils/forms-track-by';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {BreadcrumbsEllipsisPipe} from '@common/shared/pipes/breadcrumbs-ellipsis.pipe';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {NgIf} from '@angular/common';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';


@Component({
  selector: 'sm-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkVirtualScrollViewport,
    CardComponent,
    TooltipDirective,
    SaferPipe,
    BreadcrumbsEllipsisPipe,
    InlineEditComponent,
    ShowTooltipIfEllipsisDirective,
    ProjectsSharedModule,
    CircleCounterComponent,
    CdkFixedSizeVirtualScroll,
    NgIf,
    CdkVirtualForOf,
    ClickStopPropagationDirective
  ],
  standalone: true
})
export class ProjectCardComponent {
  private _project: ProjectsGetAllResponseSingle;
  public computeTime: string;
  public hidden = false;
  trackById = trackById;
  readonly circleTypeEnum = CircleTypeEnum;
  readonly icons = ICONS;

  @Input() projectsNames: string[];

  @Input() set project(data: Project) {
    this._project = data;
    this.hidden = data.hidden || data.system_tags?.includes('hidden');
    this.computeTime = this.convertSecToDaysHrsMinsSec(data.stats?.active?.total_runtime);
  };

  get project() {
    return this._project;
  }

  @Input() isRootProject;
  @Input() hideProjectPathIcon = false;
  @Input() hideMenu = false;
  @Output() projectCardClicked = new EventEmitter<Project>();
  @Output() projectNameChanged = new EventEmitter();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() moveToClicked = new EventEmitter<Project>();
  @Output() newProjectClicked = new EventEmitter<Project>();
  @ViewChild('projectName', {static: true}) projectName;


  public convertSecToDaysHrsMinsSec(secs) {
    const dayInSec = 60 * 60 * 24;
    const hourInSec = 60 * 60;
    const minInSec = 60;
    const d = Math.floor(secs / dayInSec);
    const h = Math.floor((secs - (d * dayInSec)) / hourInSec);
    const m = Math.floor((secs - (d * dayInSec + h * hourInSec)) / minInSec);
    const s = secs % 60;
    const H = h < 10 ? '0' + h : h;
    const M = m < 10 ? '0' + m : m;
    const S = s < 10 ? '0' + s : s;
    return `${d === 1 ? d + ' DAY ' : d > 1 ? d + ' DAYS ' : ''} ${H}:${M}:${S}`;
  }

  public projectClicked() {
      this.projectCardClicked.emit(this.project);
  }



  subProjectClicked(id: string) {
    this.projectCardClicked.emit({id});
  }

  prepareProjectNameForChange(projectName: string) {
    this.projectNameChanged.emit(this.project.name.substring(0, this.project.name.lastIndexOf('/') + 1) + projectName);
  }
}
