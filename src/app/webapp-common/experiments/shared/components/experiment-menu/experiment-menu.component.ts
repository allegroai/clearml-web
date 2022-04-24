import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {filter, take, withLatestFrom} from 'rxjs/operators';
import {ICONS} from '@common/constants';
import {Queue} from '~/business-logic/model/queues/queue';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {IExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {CloneForm} from '../../common-experiment-model.model';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {htmlTextShorte, isReadOnly} from '@common/shared/utils/shared-utils';
import * as commonMenuActions from '../../../actions/common-experiments-menu.actions';
import {archiveSelectedExperiments, abortAllChildren} from '../../../actions/common-experiments-menu.actions';
import {ChangeProjectDialogComponent} from '../change-project-dialog/change-project-dialog.component';
import {CloneDialogComponent} from '../clone-dialog/clone-dialog.component';
import {SelectQueueComponent} from '../select-queue/select-queue.component';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {GetQueuesForEnqueue} from '../select-queue/select-queue.actions';
import {selectQueuesList} from '../select-queue/select-queue.reducer';
import {isDevelopment} from '~/features/experiments/shared/experiments.utils';
import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BaseContextMenuComponent} from '@common/shared/components/base-context-menu/base-context-menu.component';
import * as experimentsActions from '../../../actions/common-experiments-view.actions';
import {ShareDialogComponent} from '@common/shared/ui-components/overlay/share-dialog/share-dialog.component';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {selectNeverShowPopups} from '@common/core/reducers/view.reducer';
import {CommonDeleteDialogComponent} from '@common/shared/entity-page/entity-delete/common-delete-dialog.component';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {DeactivateEdit, SetExperiment} from '../../../actions/common-experiments-info.actions';
import {neverShowPopupAgain} from '@common/core/actions/layout.actions';
import {
  selectionDisabledAbort,
  selectionDisabledAbortAllChildren,
  selectionDisabledArchive,
  selectionDisabledDequeue,
  selectionDisabledEnqueue,
  selectionDisabledMoveTo,
  selectionDisabledPublishExperiments,
  selectionDisabledReset
} from '@common/shared/entity-page/items.utils';
import {WelcomeMessageComponent} from '@common/layout/welcome-message/welcome-message.component';


@Component({
  selector: 'sm-experiment-menu',
  templateUrl: './experiment-menu.component.html',
  styleUrls: ['./experiment-menu.component.scss']
})
export class ExperimentMenuComponent extends BaseContextMenuComponent implements OnInit {
  readonly ICONS = ICONS;
  readonly TaskStatusEnum = TaskStatusEnum;
  readonly TaskTypeEnum = TaskTypeEnum;

  public open: boolean;
  public isExample: boolean;
  public isArchive: boolean;
  public selectionHasExamples: boolean;
  protected _experiment: ISelectedExperiment = null;
  private _selectedExperiments: ISelectedExperiment[];
  @Input() selectedExperiment: any;
  @Input() isSharedAndNotOwner = false;
  @Input() tagsFilterByProject: boolean;
  @Input() projectTags: string[];
  @Input() companyTags: string[];
  @Input() numSelected = 0;
  @Input() activateFromMenuButton = true;

  @Input() set experiment(experiment: ISelectedExperiment) {
    this._experiment = experiment;
    this.isExample = isReadOnly(experiment);
    this.isArchive = experiment?.system_tags?.includes('archived');
  }


  @Output() tagSelected = new EventEmitter<string>();
  @Input() neverShowPopups;
  @Input() minimizedView: boolean;

  @Input() set selectedExperiments(experiments: ISelectedExperiment[]) {
    this._selectedExperiments = experiments;
    this.selectionHasExamples = experiments && experiments.some((exp => isReadOnly(exp)));
  }

  get selectedExperiments(): ISelectedExperiment[] {
    return this._selectedExperiments;
  }

  get experiment() {
    return this._experiment;
  }

  public isCommunity: boolean;

  constructor(
    protected blTaskService: BlTasksService,
    protected dialog: MatDialog,
    protected router: Router,
    protected store: Store<IExperimentInfoState>,
    protected syncSelector: SmSyncStateSelectorService,
    protected eRef: ElementRef,
    protected configService: ConfigurationService,
    protected route?: ActivatedRoute
  ) {
    super(store, eRef);
  }


  ngOnInit(): void {
    this.isCommunity = this.configService.getStaticEnvironment().communityServer;
  }

  public restoreArchive(entityType?: EntityTypeEnum) {
    // info header case
    const selectedExperiments = this.selectedExperiments ? selectionDisabledArchive(this.selectedExperiments).selectedFiltered : [this._experiment];

    if (selectedExperiments[0].system_tags?.includes('archived')) {
      this.store.dispatch(commonMenuActions.restoreSelectedExperiments({selectedEntities: selectedExperiments, entityType}));
    } else {
      const showShareWarningDialog = selectedExperiments.find(item => item?.system_tags.includes('shared')) &&
        !this.syncSelector.selectSync(selectNeverShowPopups)?.includes('archive-shared-task');
      if (showShareWarningDialog) {
        this.showConfirmArchiveExperiments(this.store, this.dialog, selectedExperiments);
      } else {
        this.store.dispatch(commonMenuActions.archiveSelectedExperiments({selectedEntities: selectedExperiments, entityType}));
      }
    }
  }

  toggleFullScreen(showFullScreen: boolean) {
    if (showFullScreen) {
      if (!this.selectedExperiment) {
        this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this._experiment.id}/output/execution`);
      } else {
        if (window.location.pathname.includes('info-output')) {
          const resultsPath = window.location.pathname.split('info-output/')[1];
          this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this._experiment.id}/output/${resultsPath}`);
        } else {
          const parts = this.router.url.split('/');
          parts.splice(5, 0, 'output');
          this.router.navigateByUrl(parts.join('/'));
        }
      }
    } else {
      const part = this.route.firstChild.routeConfig.path;
      if (['log', 'metrics/scalar', 'metrics/plots', 'debugImages'].includes(part)) {
        this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this._experiment.id}/info-output/${part}`);
      } else {
        this.router.navigateByUrl(`projects/${this.projectId}/experiments/${this._experiment.id}/${part}`);
      }
    }
  }

  enqueuePopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledEnqueue(this.selectedExperiments).selectedFiltered : [this._experiment];

    const selectQueueDialog: MatDialogRef<SelectQueueComponent, { confirmed: boolean; queue: Queue }> =
      this.dialog.open(SelectQueueComponent, {
        data: {taskIds: selectedExperiments.map(exp => exp.id), reference: selectedExperiments[0].name}
      });

    selectQueueDialog.afterClosed().pipe(withLatestFrom(this.store.select(selectNeverShowPopups))).subscribe(([res, neverShowAgainPopups]) => {
      if (res && res.confirmed) {
        this.enqueueExperiment(res.queue, selectedExperiments);
        this.blTaskService.setPreviouslyUsedQueue(res.queue);
        if (res.queue.workers.length === 0 && (!neverShowAgainPopups.includes('orphanedQueue'))) {
          const orphanedQueueDialog: MatDialogRef<WelcomeMessageComponent> = this.dialog.open(WelcomeMessageComponent, {
            data: {
              queue: res.queue,
              step: 2
            }
          });
          orphanedQueueDialog.afterClosed().subscribe((doNotShowAgain) => {
            if (doNotShowAgain) {
              this.store.dispatch(neverShowPopupAgain({popupId: 'orphanedQueue'}));
            }
          });
        }
      }
    });
  }

  dequeuePopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledDequeue(this.selectedExperiments).selectedFiltered : [this._experiment];

    const getBody = (queueName: string) => `<b>${selectedExperiments.length === 1 ? htmlTextShorte(this._experiment.name) : selectedExperiments.length + 'experiments'}</b> will be removed from the ${queueName ? '<b>' + queueName + '</b> ' : ''}execution queue.`;
    this.store.dispatch(new GetQueuesForEnqueue());
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Dequeue Experiment',
        body: getBody(null),
        yes: 'Dequeue',
        no: 'Cancel',
        iconClass: 'i-alert',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.dequeueExperiment(selectedExperiments);
      }
    });
    this.store.select(selectQueuesList)
      .pipe(filter(qs => !!qs), take(2))
      .subscribe((queues: Queue[]) => {
        const queue = queues.find(q => q.entries.some(entry => (entry.task as any).id === this._experiment.id));
        if (confirmDialogRef.componentInstance && queue) {
          confirmDialogRef.componentInstance.body = getBody(queue.name);
        }
      });

  }

  private enqueueExperiment(queue, selectedExperiments) {
    this.store.dispatch(commonMenuActions.enqueueClicked({selectedEntities: selectedExperiments, queue}));
  }

  private dequeueExperiment(selectedExperiments) {
    this.store.dispatch(commonMenuActions.dequeueClicked({selectedEntities: selectedExperiments}));
  }

  public enqueueDequeueDisabled() {
    return !(this.blTaskService.canEnqueue(this._experiment as any) || this.blTaskService.canDequeue(this._experiment as any));
  }

  public resetPopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledReset(this.selectedExperiments).selectedFiltered : [this._experiment];
    const devWarning: boolean = selectedExperiments.some(exp => isDevelopment(exp));
    // const devWarning: boolean = isDevelopment(this._experiment);
    const body = `<b>${selectedExperiments.length === 1 ? htmlTextShorte(selectedExperiments[0]?.name || '') : selectedExperiments.length + ' experiments'}</b>
will be reset.<br>
Resetting an experiment deletes all of its data, including statistics, debug samples, logs, and temporary models.` +
      (devWarning ? `<br><br><b>Note: resetting a DEV experiment</b> Any subsequent runs of the experiment will overwrite any changes made to it in the Web-App.<br>
To avoid this, <b>clone the experiment</b> and work with the cloned experiment.` : '');
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'RESET EXPERIMENTS',
        body,
        yes: 'Reset',
        no: 'Cancel',
        iconClass: 'i-alert',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.resetExperiment(selectedExperiments);
      }
    });
  }

  private resetExperiment(selectedExperiments) {
    this.store.dispatch(commonMenuActions.resetClicked({selectedEntities: selectedExperiments}));
  }

  public stopPopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledAbort(this.selectedExperiments).selectedFiltered : [this._experiment];

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'ABORT',
        body: `<b>${selectedExperiments.length === 1 ? htmlTextShorte(selectedExperiments[0]?.name || '') : selectedExperiments.length + ' experiments'}</b>
 will be stopped and additional model updates will not be allowed.<br>
                `,
        yes: 'Abort',
        no: 'Cancel',
        iconClass: 'al-icon al-ico-abort al-color',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.stopExperiment(selectedExperiments);
      }
    });
  }

  stopExperiment(selectedExperiments) {
    this.store.dispatch(commonMenuActions.stopClicked({selectedEntities: selectedExperiments}));
  }


  public publishPopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledPublishExperiments(this.selectedExperiments).selectedFiltered : [this._experiment];
    const publishPopupBody = `<b>${selectedExperiments.length === 1 ? htmlTextShorte(selectedExperiments[0]?.name || '') : selectedExperiments.length + ' experiments'}</b>
 status will be set to Published.<br><br>
 Published experiments are read-only and cannot be reset. The experiment's output, including models will also be published so that other experiments can use it.`;

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'PUBLISH EXPERIMENTS',
        body: publishPopupBody,
        yes: 'Publish',
        no: 'Cancel',
        iconClass: 'd-block fas fa-cloud-upload-alt fa-7x w-auto',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.publishExperiment(selectedExperiments);
      }
    });
  }

  publishExperiment(selectedExperiments) {
    this.store.dispatch(commonMenuActions.publishClicked({selectedEntities: selectedExperiments}));
  }

  shareExperimentPopup() {
    this.dialog.open(ShareDialogComponent, {
      data: {
        title: 'SHARE EXPERIMENT PUBLICLY',
        link: `${window.location.origin}/projects/${this._experiment.project.id}/experiments/${this._experiment.id}/output/execution`,
        alreadyShared: this._experiment?.system_tags.includes('shared'),
        task: this._experiment?.id
      }
    });
  }

  public moveToProjectPopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledMoveTo(this.selectedExperiments).selectedFiltered : [this._experiment];
    const currentProjects = Array.from(new Set(selectedExperiments.map(exp => exp.project?.id).filter(p => p)));
    const dialog = this.dialog.open(ChangeProjectDialogComponent, {
      data: {
        currentProjects: currentProjects.length > 0 ? currentProjects : [this.projectId],
        defaultProject: get('project.id', this._experiment),
        reference: selectedExperiments.length > 1 ? selectedExperiments : selectedExperiments[0]?.name,
        type: 'experiment'
      }
    });
    dialog.afterClosed().pipe(filter(project => !!project)).subscribe(project => {
      this.moveToProjectClicked(project, selectedExperiments);
    });
  }

  moveToProjectClicked(project, selectedExperiments) {
    this.store.dispatch(commonMenuActions.changeProjectRequested({
      selectedEntities: selectedExperiments,
      project: project
    }));
  }

  viewWorkerClicked() {
    this.router.navigateByUrl('/workers-and-queues/workers');
  }

  manageQueueClicked() {
    this.store.dispatch(commonMenuActions.navigateToQueue({experimentId: this._experiment?.id}));
  }

  clonePopup() {
    const confirmDialogRef = this.dialog.open(CloneDialogComponent, {
      data: {
        type: 'Experiment',
        defaultProject: this._experiment?.project?.id,
        defaultName: this._experiment.name
      }
    });

    confirmDialogRef.afterClosed().pipe(
      filter(res => !!res),
      take(1)
    ).subscribe((res: CloneForm) => {
      this.cloneExperiment(res);
    });
  }

  cloneExperiment(cloneData) {
    this.store.dispatch(new commonMenuActions.CloneExperimentClicked({
      originExperiment: this._experiment,
      cloneData: {
        ...cloneData,
        project: cloneData.project.value,
        newProjectName: cloneData.project.value ? undefined : cloneData.project.label
      }
    }));
  }

  deleteExperimentPopup(entityType?: EntityTypeEnum, includeChildren?: boolean) {
    const confirmDialogRef = this.dialog.open(CommonDeleteDialogComponent, {
      data: {
        entity: this._experiment,
        numSelected: this.numSelected,
        entityType: entityType || EntityTypeEnum.experiment,
        useCurrentEntity: this.activateFromMenuButton,
        includeChildren
      },
      width: '600px',
      disableClose: true
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(experimentsActions.setSelectedExperiments({experiments: []}));
        this.store.dispatch(new SetExperiment(null));
        this.store.dispatch(experimentsActions.getExperiments());
        this.store.dispatch(new DeactivateEdit());
        if (this.activateFromMenuButton || this.selectedExperiments.map(e => e.id).includes(this.selectedExperiment?.id)) {
          window.setTimeout(() => this.router.navigate([`projects/${this.projectId}/experiments`], {queryParamsHandling: 'preserve'}));
        }
      }
    });
  }

  showConfirmArchiveExperiments(store: Store, dialog: MatDialog, selectedExperiments: ISelectedExperiment[]): void {
    const confirmDialogRef = dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'ARCHIVE A PUBLICLY SHARED TASK',
        body: `This task is accessible through a public access link.
            Archiving will disable public access`,
        yes: 'OK',
        no: 'Cancel',
        iconClass: 'al-icon al-ico-archive al-color',
        showNeverShowAgain: true
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        store.dispatch(archiveSelectedExperiments({selectedEntities: selectedExperiments}));
        if (confirmed.neverShowAgain) {
          store.dispatch(neverShowPopupAgain({popupId: 'archive-shared-task'}));
        }
      }
    });
  }

  stopAllChildrenPopup() {
    const selectedExperiments = this.selectedExperiments ? selectionDisabledAbortAllChildren(this.selectedExperiments).selectedFiltered : [this._experiment];
    this.store.dispatch(abortAllChildren({experiments: selectedExperiments}));
  }

  toggleDetails () {
    this.store.dispatch(experimentsActions.experimentSelectionChanged({
      experiment: this._experiment,
      project: this.projectId
    }));
  }
}
