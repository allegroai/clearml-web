import {Component, OnDestroy, OnInit, inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {combineLatest, filter, Subscription} from 'rxjs';
import {Queue} from '~/business-logic/model/queues/queue';
import {selectQueuesList} from '../../experiments/shared/components/select-queue/select-queue.reducer';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {getQueuesForEnqueue} from '@common/experiments/shared/components/select-queue/select-queue.actions';
import {cloneDeep} from 'lodash-es';
import {
  getControllerForStartPipelineDialog,
  setControllerForStartPipelineDialog
} from '../../experiments/actions/common-experiments-menu.actions';
import {selectStartPipelineDialogTask} from '../../experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';

export interface RunPipelineResult {
  confirmed: boolean;
  queue: Queue;
  args: {name: string; value: string}[];
  task: string;
}

@Component({
  selector: 'sm-run-pipeline-controller-dialog',
  templateUrl: './run-pipeline-controller-dialog.component.html',
  styleUrls: ['./run-pipeline-controller-dialog.component.scss']
})
export class RunPipelineControllerDialogComponent implements OnInit, OnDestroy {
  public dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef<ConfirmDialogComponent>);
  private store = inject(Store);
  public data = inject<{ task }>(MAT_DIALOG_DATA);
  public queues: Queue[];
  public selectedQueue: Queue;
  public queues$ = this.store.select(selectQueuesList);
  public baseController$ = this.store.select(selectStartPipelineDialogTask);
  public title: string;
  public params: any;
  public task: IExperimentInfo;
  private queuesSub: Subscription;
  private baseControllerSub: Subscription;
  private selectedQueueSub: Subscription;

  constructor() {
    if (this.data?.task?.hyperparams?.Args) {
      this.store.dispatch(setControllerForStartPipelineDialog({task: this.data.task}));
    } else {
      this.store.dispatch(getControllerForStartPipelineDialog({task: this.data.task?.id}));
    }

    this.queuesSub = this.queues$.subscribe(queues => {
      if (queues) {
        this.queues = queues;
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(getQueuesForEnqueue());
    this.baseControllerSub = this.baseController$.pipe(filter(task => !!task)).subscribe(task => {
      this.task = task;
      this.title = this.getTitle();
      this.params = task?.hyperparams?.Args && cloneDeep(Object.values(task.hyperparams.Args).filter((param: any) => !param?.name?.startsWith('_')));
    });
    this.selectedQueueSub = combineLatest([this.baseController$, this.queues$])
      .pipe(filter(([baseController, queues]) => !!baseController && queues?.length > 0)).subscribe(([baseController, queues]) => {
        this.selectedQueue = queues.find(queue => baseController.execution?.queue?.id === queue?.id) || null;
      });
  }

  closeDialog(confirmed) {
    this.dialogRef.close({
      confirmed,
      queue: this.selectedQueue,
      args: this.params?.map(param => ({name: param.name, value: param.value})),
      task: this.task.id
    } as RunPipelineResult);
  }

  ngOnDestroy(): void {
    this.queuesSub.unsubscribe();
    this.baseControllerSub.unsubscribe();
    this.store.dispatch(setControllerForStartPipelineDialog({task: null}));
  }

  getTitle() {
    const version = this.task?.hyperparams?.properties?.version?.value;
    if (version) {
      return `${this.task.name} v${version}`;
    }
    return this.task.name;
  }

  displayFn = (entityObj: { name: string; id: string }) => entityObj?.name ?? '';

  isFocused = (locationRef: HTMLInputElement) => document.activeElement === locationRef;

}
