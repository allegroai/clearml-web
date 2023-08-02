import {Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {getSystemTags, isDevelopment} from '~/features/experiments/shared/experiments.utils';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectCompanyTags, selectTagsFilterByProject} from '@common/core/reducers/projects.reducer';
import {addTag, removeTag} from '../../actions/common-experiments-menu.actions';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {activateEdit, deactivateEdit, setExperiment} from '../../actions/common-experiments-info.actions';
import {EXPERIMENTS_STATUS_LABELS, ExperimentTagsEnum} from '~/features/experiments/shared/experiments.const';
import {EXPERIMENT_COMMENT} from '../experiment-general-info/experiment-general-info.component';
import {ActivatedRoute, Router} from '@angular/router';
import {
  MenuItems,
  selectionDisabledAbort,
  selectionDisabledAbortAllChildren,
  selectionDisabledArchive,
  selectionDisabledDelete,
  selectionDisabledDequeue,
  selectionDisabledEnqueue,
  selectionDisabledMoveTo,
  selectionDisabledPublishExperiments,
  selectionDisabledQueue,
  selectionDisabledReset,
  selectionDisabledViewWorker
} from '@common/shared/entity-page/items.utils';
import {addMessage} from '@common/core/actions/layout.actions';
import {MatMenuTrigger} from '@angular/material/menu';
import { selectExperimentsTags } from '@common/experiments/reducers';

@Component({
  selector: 'sm-experiment-info-header',
  templateUrl: './experiment-info-header.component.html',
  styleUrls: ['./experiment-info-header.component.scss']
})
export class ExperimentInfoHeaderComponent implements OnDestroy {

  public viewId: boolean;
  public tagsFilterByProject$: Observable<boolean>;
  public projectTags$: Observable<string[]>;
  public companyTags$: Observable<string[]>;
  public isDev = false;
  public systemTags = [] as string[];
  public shared: boolean;
  public isPipeline: boolean;
  public selectedDisableAvailable = {};

  @Input() editable: boolean = true;
  @Input() infoData;
  @Input() backdropActive = false;
  @Input() showMenu: boolean;
  @Input() minimized: boolean;
  @Input() isSharedAndNotOwner: boolean;
  @Output() experimentNameChanged = new EventEmitter<string>();
  @Output() minimizeClicked = new EventEmitter();
  @Output() closeInfoClicked = new EventEmitter();
  @Output() maximizedClicked = new EventEmitter();
  @ViewChild('tagsMenuTrigger') tagMenuTrigger: MatMenuTrigger;
  @ViewChild(TagsMenuComponent) tagMenu: TagsMenuComponent;

  constructor(private store: Store, private router: Router, private activatedRoute: ActivatedRoute) {
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectExperimentsTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
  }

  ngOnDestroy(): void {
    this.tagMenuTrigger = null;
    this.tagMenu = null;
    this.store.dispatch(setExperiment(null));
  }

  private _experiment: any;
  get experiment() {
    return this._experiment;
  }

  @Input() set experiment(experiment) {
    if (experiment?.id !== this._experiment?.id) {
      this.viewId = false;
    }
    this._experiment = experiment;
    this.isDev = isDevelopment(experiment);
    this.systemTags = getSystemTags(experiment);

    this.isPipeline = !!experiment?.system_tags?.includes(ExperimentTagsEnum.Pipeline);
    this.shared = experiment?.system_tags?.includes(ExperimentTagsEnum.Shared);
    this.selectedDisableAvailable = {
      [MenuItems.abort]: selectionDisabledAbort([experiment]),
      [MenuItems.abortAllChildren]: selectionDisabledAbortAllChildren([experiment]),
      [MenuItems.publish]: selectionDisabledPublishExperiments([experiment]),
      [MenuItems.reset]: selectionDisabledReset([experiment]),
      [MenuItems.delete]: selectionDisabledDelete([experiment]),
      [MenuItems.moveTo]: selectionDisabledMoveTo([experiment]),
      [MenuItems.enqueue]: selectionDisabledEnqueue([experiment]),
      [MenuItems.dequeue]: selectionDisabledDequeue([experiment]),
      [MenuItems.queue]: selectionDisabledQueue([experiment]),
      [MenuItems.viewWorker]: selectionDisabledViewWorker([experiment]),
      [MenuItems.archive]: selectionDisabledArchive([experiment])
    };
  }


  onNameChanged(name) {
    this.experimentNameChanged.emit(name);
  }

  openTagMenu() {
    if (!this.tagMenuTrigger) {
      return;
    }
    window.setTimeout(() => this.store.dispatch(activateEdit('tags')), 200);
    window.setTimeout(() => {
      this.tagMenuTrigger.openMenu();
      this.tagMenu.focus();
    });
  }

  addTag(tag: string) {
    this.store.dispatch(addTag({tag, experiments: [this.experiment]}));
  }

  removeTag(tag: string) {
    this.store.dispatch(removeTag({tag, experiments: [this.experiment]}));
  }

  tagsMenuClosed() {
    this.store.dispatch(deactivateEdit());
    this.tagMenu.clear();
  }

  editExperimentName(edit) {
    if (edit) {
      this.store.dispatch(activateEdit('ExperimentName'));
    } else {
      this.store.dispatch(deactivateEdit());
    }
  }

  showID() {
    this.viewId = true;
  }

  getStatusLabel() {
    return EXPERIMENTS_STATUS_LABELS[this.experiment?.status] || '';
  }

  editDescriptionHandler() {
    this.router.navigate(['general'], {relativeTo: this.activatedRoute});
    window.setTimeout(() => this.store.dispatch(activateEdit(EXPERIMENT_COMMENT)), 50);
  }

  copyToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }
}
