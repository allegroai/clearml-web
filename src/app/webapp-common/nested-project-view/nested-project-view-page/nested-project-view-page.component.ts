import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {trackById} from '@common/shared/utils/forms-track-by';
import {isExample} from '@common/shared/utils/shared-utils';

export enum ProjectTypeEnum {
  pipelines = 'pipelines',
  datasets = 'datasets',
  hyperDatasets = 'hyperdatasets',
  reports = 'reports',
}

@Component({
  selector: 'sm-nested-project-view-page',
  templateUrl: './nested-project-view-page.component.html',
  styleUrls: ['./nested-project-view-page.component.scss']
})
export class NestedProjectViewPageComponent {
  trackById = trackById;
  isExample = isExample;
  hideMenu = false;
  circleTypeEnum = CircleTypeEnum;
  entityTypeEnum = ProjectTypeEnum;

  @Input() totalVirtualCards: number = 0;
  @Input() entityType: ProjectTypeEnum;
  @Input() projectsList: Project[];
  @Input() allExamples: boolean;
  @Input() showExamples: boolean;
  @Input() searching: boolean;
  @Input() projectsOrderBy: any;
  @Input() projectsSortOrder: any;
  @Input() projectsTags: string[];
  @Input() noMoreProjects: boolean;
  @Input() cardContentTemplateRef: TemplateRef<any>;
  @Input() cardContentFooterTemplateRef: TemplateRef<any>;
  @Output() cardClicked = new EventEmitter<{ hasSubProjects: boolean; id: string; name: string }>();
  @Output() toggleNestedView = new EventEmitter<boolean>();
  @Output() orderByChanged = new EventEmitter();
  @Output() projectNameChanged = new EventEmitter<{ id: string; name: string }>();
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() removeTag = new EventEmitter<{ project: Project; tag: string }>();
  @Output() loadMore = new EventEmitter();

}
