import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {combineLatest, filter, Subscription} from 'rxjs';
import {Queue} from '~/business-logic/model/queues/queue';
import {selectQueuesList} from '../../experiments/shared/components/select-queue/select-queue.reducer';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {GetQueuesForEnqueue} from '@common/experiments/shared/components/select-queue/select-queue.actions';
import {cloneDeep} from 'lodash/fp';
import {
  getControllerForStartPipelineDialog,
  setControllerForStartPipelineDialog
} from '../../experiments/actions/common-experiments-menu.actions';
import {selectStartPipelineDialogTask} from '../../experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';

@Component({
  selector: 'sm-run-pipeline-controller-dialog',
  templateUrl: './run-pipeline-controller-dialog.component.html',
  styleUrls: ['./run-pipeline-controller-dialog.component.scss']
})
export class RunPipelineControllerDialogComponent implements OnInit, OnDestroy {
  public queues: Array<Queue>;
  public selectedQueue: Queue;
  public queues$ = this.store.select(selectQueuesList);
  public baseController$ = this.store.select(selectStartPipelineDialogTask);
  public title: string;
  public params: any;
  public task: IExperimentInfo;
  public chooseCustomQueue: boolean= false
  private queuesSub: Subscription;
  private baseControllerSub: Subscription;
  private selectedQueueSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private store: Store<any>,
    @Inject(MAT_DIALOG_DATA) public data: { task }
  ) {
    if (data?.task?.hyperparams?.Args) {
      this.store.dispatch(setControllerForStartPipelineDialog({task: data.task}))
    } else {
      this.store.dispatch(getControllerForStartPipelineDialog({task: data.task?.id}))
    }

    this.queuesSub = this.queues$.subscribe(queues => {
      if (queues) {
        this.queues = queues;
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(new GetQueuesForEnqueue());
    this.baseControllerSub = this.baseController$.pipe(filter(task => !!task)).subscribe(task => {
      this.task = task;
      this.title = this.getTitle();
      this.params = task?.hyperparams?.Args && cloneDeep(Object.values(task.hyperparams.Args).filter((param: any) => !param?.name?.startsWith('_')));
    })
    this.selectedQueueSub = combineLatest([this.baseController$, this.queues$])
      .pipe(filter(([baseController, queues]) => !!baseController && queues?.length > 0)).subscribe(([baseController, queues]) => {
        this.selectedQueue = queues.find(queue => baseController.execution?.queue?.id === queue?.id) || queues[0];
      })
  }

  closeDialog(confirmed) {
    this.dialogRef.close({
      confirmed,
      queue: this.selectedQueue?.id,
      args: this.params?.map(param => ({name: param.name, value: param.value})),
      task: this.task.id
    });
  }

  ngOnDestroy(): void {
    this.queuesSub.unsubscribe();
    this.baseControllerSub.unsubscribe()
    this.store.dispatch(setControllerForStartPipelineDialog({task: null}))
  }

  changeChooseCustomQueue() {
    this.chooseCustomQueue = !this.chooseCustomQueue;
    if(!this.chooseCustomQueue){
      this.selectedQueue = this.queues.find(queue => this.task.execution?.queue?.id === queue?.id) || this.queues[0];
    }
  }

  getTitle() {
    const version = this.task?.hyperparams?.properties?.version.value;
    if (version) {
      return `${this.task.name} v${version}`;
    }
    return this.task.name;
  }
}
