import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ProjectsGetAllResponseSingle} from '../../../../../business-logic/model/projects/projectsGetAllResponseSingle';
import {StatsStatusCountStatusCount} from '../../../../../business-logic/model/projects/statsStatusCountStatusCount';
import {CircleTypeEnum} from '../../../../../shared/constants/non-common-consts';
import {Project} from '../../../../../business-logic/model/projects/project';


@Component({
  selector: 'sm-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {
  @Input() project;
  @Input() isRootProject;
  @Input() hideMenu = false;
  @Output() projectCardClicked = new EventEmitter<ProjectsGetAllResponseSingle>();
  @Output() projectNameChanged = new EventEmitter();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() moveToClicked = new EventEmitter<string>();
  @Output() newProjectClicked = new EventEmitter<string>();
  @ViewChild('projectName', {static: true}) projectName;
  readonly CircleTypeEnum = CircleTypeEnum;

  private projectNameActive = false;

  constructor() {
  }

  ngOnInit() {
  }

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
    if (!this.projectNameActive) {
      this.projectCardClicked.emit(this.project);
    }
  }

  public projectNameEditActiveChanged(active) {
    setTimeout(() => this.projectNameActive = active, 100);
  }

  public isProjectDeletable(project: ProjectsGetAllResponseSingle) {
    return !Object.values(project.stats.active.status_count).some(count => count > 0);
  }

  countAllTasks(status_count: StatsStatusCountStatusCount) {
    return this.sumValues(status_count);
  }

  public sumValues(obj) {
    if (!obj) {
      return 0
    };
    return Object.values(obj).reduce((a, b) => {
      return (a as number) + (b as number);
    });
  }

  subProjectClicked(id: string) {
    this.projectCardClicked.emit({id});
  }

  prepareProjectNameForChange(projectName: string) {
    this.projectNameChanged.emit(this.project.name.substring(0, this.project.name.lastIndexOf('/') + 1) + projectName);
  }
}
