import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {ITask} from '~/business-logic/model/al-task';
import {Model} from '~/business-logic/model/models/model';
import {activeLinksList, ActiveSearchLink, activeSearchLink} from '~/features/dashboard-search/dashboard-search.consts';

@Component({
  selector: 'sm-search-results-page',
  templateUrl: './search-results-page.component.html',
  styleUrls: ['./search-results-page.component.scss']
})
export class SearchResultsPageComponent {
  public searchPages = activeSearchLink;
  public activeLinksList = activeLinksList;

  @Input() projectsList: Array<Project> = [];
  @Input() experimentsList: Array<Task> = [];
  @Input() modelsList: Array<Model> = [];
  @Input() pipelinesList: Array<Project> = [];
  @Input() datasetsList: Array<Project> = [];
  @Input() activeLink: ActiveSearchLink;
  @Input() resultsCount: Map<ActiveSearchLink, number>;

  @Output() projectSelected = new EventEmitter<Project>();
  @Output() activeLinkChanged = new EventEmitter<string>();
  @Output() experimentSelected = new EventEmitter<ITask>();
  @Output() modelSelected = new EventEmitter<Model>();
  @Output() pipelineSelected = new EventEmitter<Project>();
  @Output() openDatasetSelected = new EventEmitter<Project>();
  @Output() loadMoreClicked = new EventEmitter();

  public projectClicked(project: Project) {
    this.projectSelected.emit(project);
  }

  public experimentClicked(experiment: ITask) {
    this.experimentSelected.emit(experiment);
  }

  public modelClicked(model: Model) {
    this.modelSelected.emit(model);
  }

  public pipelineClicked(pipeline: Project) {
    this.pipelineSelected.emit(pipeline);
  }

  public openDatasetClicked(project: Project) {
    this.openDatasetSelected.emit(project);
  }

  getResults = () => this[`${this.activeLink}List`];

  getCardHeight() {
    switch (this.activeLink) {
      case activeSearchLink.projects:
        return 246;
      case activeSearchLink.experiments:
      case activeSearchLink.models:
        return 264;
      case activeSearchLink.pipelines:
        return 226;
      default:
        return 250;
    }
  }
}
