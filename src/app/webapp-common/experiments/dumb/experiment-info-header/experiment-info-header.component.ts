import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TaskStatusEnum} from '../../../../business-logic/model/tasks/taskStatusEnum';
import {TaskTypeEnum} from '../../../../business-logic/model/tasks/taskTypeEnum';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {getSystemTags, isDevelopment} from '../../../../features/experiments/shared/experiments.utils';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectProjectTags} from '../../../core/reducers/projects.reducer';
import {getTags} from '../../../core/actions/projects.actions';
import {addTag, removeTag} from '../../actions/common-experiments-menu.actions';
import {MatMenuTrigger} from '@angular/material/menu';
import {TagsMenuComponent} from '../../../shared/ui-components/tags/tags-menu/tags-menu.component';
import {EXPERIMENTS_TAGS} from '../../../../features/experiments/shared/experiments.const';
import {MenuComponent} from '../../../shared/ui-components/panel/menu/menu.component';

@Component({
  selector   : 'sm-experiment-info-header',
  templateUrl: './experiment-info-header.component.html',
  styleUrls  : ['./experiment-info-header.component.scss']
})
export class ExperimentInfoHeaderComponent {

  readonly TaskStatusEnum = TaskStatusEnum;
  readonly TaskTypeEnum   = TaskTypeEnum;

  public viewId: boolean;
  public tags$: Observable<string[]>;
  public isDev = false;
  public systemTags = [] as string[];

  @Input() editable: boolean = true;
  @Input() infoData;
  @Input() backdropActive    = false;
  @Input() showMenu: boolean;
  @Input() showMinimize: boolean;
  @Output() experimentNameChanged = new EventEmitter<string>();
  @Output() minimizeClicked = new EventEmitter();
  @ViewChild('tagMenu') tagMenu: MenuComponent;
  @ViewChild('tagsMenuContent') tagMenuContent: TagsMenuComponent;

  constructor(private store: Store) {
    this.tags$ = this.store.select(selectProjectTags);
  }

  private _experiment: ISelectedExperiment;

  get experiment() {
    return this._experiment;
  }

  @Input() set experiment(experiment: ISelectedExperiment) {

    this._experiment = experiment;
    this.isDev = isDevelopment(experiment);
    this.systemTags = getSystemTags(experiment);
    this.viewId      = false;
  }

  onNameChanged(name) {
    this.experimentNameChanged.emit(name);
  }

  openTagMenu(event: MouseEvent) {
    this.store.dispatch(getTags());
    this.tagMenu.position = {x: event.clientX, y: event.clientY};
    window.setTimeout(() => {
      this.tagMenu.openMenu();
      this.tagMenuContent.focus();
    });
  }

  addTag(tag: string) {
    this.store.dispatch(addTag({tag, experiments: [this.experiment]}));
  }

  removeTag(tag: string) {
    this.store.dispatch(removeTag({tag, experiments: [this.experiment]}));
  }

  tagsMenuClosed() {
    this.tagMenuContent.clear();
  }
}
