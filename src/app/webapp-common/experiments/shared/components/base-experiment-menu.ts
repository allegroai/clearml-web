import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {filter, take} from 'rxjs/operators';
import {ICONS} from '../../../../app.constants';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {TaskStatusEnum} from '../../../../business-logic/model/tasks/taskStatusEnum';
import {TaskTypeEnum} from '../../../../business-logic/model/tasks/taskTypeEnum';
import {BlTasksService} from '../../../../business-logic/services/tasks.service';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {CloneForm} from '../common-experiment-model.model';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {SmSyncStateSelectorService} from '../../../core/services/sync-state-selector.service';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {htmlTextShorte} from '../../../shared/utils/shared-utils';
import * as commonMenuActions from '../../actions/common-experiments-menu.actions';
import {ChangeProjectDialogComponent} from './change-project-dialog/change-project-dialog.component';
import {CloneDialogComponent} from './clone-dialog/clone-dialog.component';
import {SelectQueueComponent} from './select-queue/select-queue.component';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {GetQueuesForEnqueue} from './select-queue/select-queue.actions';
import {selectQueuesList} from './select-queue/select-queue.reducer';
import {isDevelopment} from '../../../../features/experiments/shared/experiments.utils';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {BaseContextMenuComponent} from '../../../shared/components/base-context-menu/base-context-menu.component';
import * as experimentsActions from '../../actions/common-experiments-view.actions';

@Component({
  selector: 'sm-base-experiment-menu',
  template: ''
})
export class BaseExperimentMenuComponent extends BaseContextMenuComponent {
  readonly ICONS          = ICONS;
  readonly TaskStatusEnum = TaskStatusEnum;
  readonly TaskTypeEnum   = TaskTypeEnum;

  public isExample: boolean;
  protected _experiment: ISelectedExperiment;
  public selectedExperiment: ISelectedExperiment;
  @Input() allTags;
  @Input() numSelected = 0;
  @Input() showButton = true;
  @Output() tagSelected = new EventEmitter<string>();

  constructor(
    protected blTaskService: BlTasksService,
    protected dialog: MatDialog,
    protected router: Router,
    protected store: Store<IExperimentInfoState>,
    protected syncSelector: SmSyncStateSelectorService,
    protected eRef: ElementRef
  ) {
    super(store, eRef);
  }

  public restoreArchivePopup() {
    const isArchived = this._experiment.system_tags && this._experiment.system_tags.includes('archived');
    let title: string, bodyName: string;
    if (this.numSelected > 1) {
      title = isArchived ? `Restore ${this.numSelected} experiments` : `Archive ${this.numSelected} experiments`;
      bodyName = `${this.numSelected} Experiments`;
    } else {
      title = isArchived ? 'Restore experiment' : 'Archive experiment';
      bodyName = htmlTextShorte(this._experiment?.name || '');
    }
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title,
        body     : `<b>${bodyName}</b> will be ${
          isArchived ? 'restored. It will be visible using "Exit Archive".'
            : 'archived. It will be visible using "Open Archive"'
        }.`,
        yes      : isArchived ? 'Restore from archive' : 'Archive',
        no       : 'keep',
        iconClass: 'i-archive',
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.restoreArchive();
      }
    });
  }

  public getProjectId() {
    const params = this.syncSelector.selectSync(selectRouterParams);
    return get('projectId', params);
  }

  private restoreArchive() {
    if (this._experiment.system_tags && this._experiment.system_tags.includes('archived')) {
      if (this.numSelected > 1) {
        this.store.dispatch(new experimentsActions.RestoreSelectedExperiments({projectId: this.getProjectId()}));
      } else {
        this.store.dispatch(new commonMenuActions.RestoreClicked({experiment: this._experiment, selectedExperiment: this.selectedExperiment, projectId: this.getProjectId()}));
      }
    } else {
      if (this.numSelected > 1) {
        this.store.dispatch(new experimentsActions.ArchivedSelectedExperiments({projectId: this.getProjectId()}));
      } else {
        this.store.dispatch(new commonMenuActions.ArchiveClicked({experiment: this._experiment, selectedExperiment: this.selectedExperiment, projectId: this.getProjectId()}));
      }
    }
  }

  showExperimentMetrics() {
    this.router.navigateByUrl(`projects/${this.getProjectId()}/experiments/${this._experiment.id}/output/metrics/scalar`);
  }

  public enqueueDequeueLabel() {
    return this.blTaskService.canDequeue(this._experiment as any) ? 'Dequeue' : 'Enqueue';
  }

  public enqueueDequeueIcon() {
    return this.blTaskService.canDequeue(this._experiment as any) ? ICONS.DEQUEUE : ICONS.ENQUEUE;
  }

  public enqueueDequeue() {
    if (this.blTaskService.canEnqueue(this._experiment as any)) {
      this.enqueuePopup();
    } else {
      this.dequeueuPopup();
    }
  }

  enqueuePopup() {
    const selectQueueDialog: MatDialogRef<SelectQueueComponent, { confirmed: boolean; queue: Queue }> =
            this.dialog.open(SelectQueueComponent, {
              data: {taskId: this._experiment.id, reference: this._experiment.name}
            });

    selectQueueDialog.afterClosed().subscribe((res) => {
      if (res && res.confirmed) {
        this.enqueueExperiment(res.queue);
        this.blTaskService.setPreviouslyUsedQueue(res.queue);
      }
    });
  }

  dequeueuPopup() {
    const getBody = (queueName: string) => `<b>${htmlTextShorte(this._experiment.name)}</b> will be removed from the ${queueName ? '<b>' + queueName + '</b> ' : ''}execution queue.`;
    this.store.dispatch(new GetQueuesForEnqueue());
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : 'Dequeue Experiment',
        body     : getBody(null),
        yes      : 'Dequeue',
        no       : 'Cancel',
        iconClass: 'i-alert',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.dequeueExperiment();
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

  private enqueueExperiment(queue) {
    this.store.dispatch(new commonMenuActions.EnqueueClicked(this._experiment, queue));
  }

  private dequeueExperiment() {
    this.store.dispatch(new commonMenuActions.DequeueClicked(this._experiment));
  }

  public enqueueDequeueDisabled() {
    return !(this.blTaskService.canEnqueue(this._experiment as any) || this.blTaskService.canDequeue(this._experiment as any));
  }

  public resetPopup() {
    const devWarning: boolean = isDevelopment(this._experiment);
    const body                = `<b>${htmlTextShorte(this._experiment?.name || '')}</b>
will be reset.<br>
Resetting an experiment deletes all of its data, including statistics, debug samples, logs, and temporary models.` +
      (devWarning ? `<br><br><b>Note: this is a DEV experiment</b> Any subsequent runs of the experiment will overwrite any changes made to it in the Web-App.<br>
To avoid this, <b>clone the experiment</b> and work with the cloned experiment.` : '');
    const confirmDialogRef    = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : 'RESET',
        body     : body,
        yes      : 'Reset',
        no       : 'Cancel',
        iconClass: 'i-alert',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.resetExperiment();
      }
    });
  }

  private resetExperiment() {
    this.store.dispatch(new commonMenuActions.ResetClicked(this._experiment));
  }

  public stopPopup() {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : 'ABORT',
        body     : `<b>${htmlTextShorte(this._experiment?.name || '')}</b> will be stopped and
                additional model updates will not be allowed.<br>
                `,
        yes      : 'Abort',
        no       : 'Cancel',
        iconClass: 'i-archive',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.stopExperiment();
      }
    });
  }

  stopExperiment() {
    this.store.dispatch(new commonMenuActions.StopClicked(this._experiment));
  }

  public publishPopupBody = `<b>${htmlTextShorte(this._experiment?.name || '')}</b> status will be set to Published.
<br><br>Published experiments are read-only and cannot be reset. The experiment's output, including models will also be published so that other experiments can use it.`;

  public publishPopup() {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : 'PUBLISH',
        body     : this.publishPopupBody,
        yes      : 'Publish',
        no       : 'Cancel',
        iconClass: 'd-block fas fa-cloud-upload-alt fa-7x w-auto',
      }
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.publishExperiment();
      }
    });
  }

  publishExperiment() {
    this.store.dispatch(new commonMenuActions.PublishClicked(this._experiment));
  }

  public moveToProjectPopup() {
    const dialog = this.dialog.open(ChangeProjectDialogComponent, {
      data: {
        currentProject: get('project.id', this._experiment) || this.getProjectId(),
        defaultProject: get('project.id', this._experiment),
        reference     : this._experiment.name,
        type          : 'experiment'
      }
    });
    dialog.afterClosed().pipe(filter(project => !!project)).subscribe(project => {
      this.moveToProjectClicked(project);
    });
  }

  moveToProjectClicked(project) {
    this.store.dispatch(new commonMenuActions.ChangeProjectRequested({experiment: this._experiment, project: project}));
  }

  viewWorkerClicked() {
    this.router.navigateByUrl('/workers-and-queues/workers');
  }

  manageQueueClicked() {
    this.router.navigateByUrl('/workers-and-queues/queues');
  }

  clonePopup() {
    const confirmDialogRef = this.dialog.open(CloneDialogComponent, {
      data: {
        type          : 'Experiment',
        defaultProject: get('project.id', this._experiment),
        defaultName   : this._experiment.name
      }
    });

    confirmDialogRef.afterClosed().pipe(
      filter(res => !!res),
      take(1)
    ).subscribe((res: CloneForm) => {
      this.cloneExperiment(res);
    });
  }

  cloneExperiment(cloneData: CloneForm) {
    this.store.dispatch(new commonMenuActions.CloneExperimentClicked({originExperiment: this._experiment, cloneData}));
  }
}
