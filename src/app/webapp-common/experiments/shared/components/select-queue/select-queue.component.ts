import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {GetQueuesForEnqueue, GetTaskForEnqueue, SetTaskForEnqueue} from './select-queue.actions';
import {selectQueuesList, selectTaskForEnqueue} from './select-queue.reducer';
import {Queue} from '~/business-logic/model/queues/queue';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {filter, map, startWith} from 'rxjs/operators';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {userAllowedToCreateQueue$} from '~/core/reducers/users.reducer';
import {trackById} from '@common/shared/utils/forms-track-by';
import {FormControl} from '@angular/forms';
import { splitLine } from '@common/shared/utils/shared-utils';

@Component({
  selector: 'sm-select-queue',
  templateUrl: './select-queue.component.html',
  styleUrls: ['./select-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectQueueComponent implements OnInit, OnDestroy {
  public queues: Queue[];
  public queues$ = this.store.select(selectQueuesList);
  public enqueueWarning$ = this.store.select(selectTaskForEnqueue)
    .pipe(filter(tasks =>
      tasks?.some(task => !(task && task.script && (task.script.diff || (task.script.repository && task.script.entry_point))))
    ));
  public userAllowedToCreateQueue$: Observable<boolean>;
  public reference: string;
  private queuesSub: Subscription;
  public queuesNames: string[];
  public queueControl = new FormControl<string | Queue>('');
  split = splitLine;
  displayFn = (item: any): string => typeof item === 'string' ? item : item?.name;
  trackById = trackById;
  public filteredOptions$: Observable<Queue[]>;
  defaultQueue: Queue;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private store: Store<any>,
    private blTaskService: BlTasksService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {
      taskIds?: string[];
      reference?: string;
    }
  ) {
    this.userAllowedToCreateQueue$ = userAllowedToCreateQueue$(store);

    if (data && data.taskIds?.length > 0) {
      this.store.dispatch(new GetTaskForEnqueue(data.taskIds));
      this.reference = data.taskIds.length < 2 ?  data.reference : `${data.taskIds.length} experiments `;
    }
    this.queuesSub = this.queues$.subscribe(queues => {
      if (queues) {
        this.queues = queues;
        this.queuesNames = queues.map(q => q.name);
        this.defaultQueue = this.blTaskService.getDefaultQueue(this.queues) || queues[0];
        this.queueControl.reset(this.defaultQueue, {emitEvent: false});
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(new GetQueuesForEnqueue());
    this.filteredOptions$ = combineLatest([
      this.queueControl.valueChanges.pipe(startWith('')),
      this.queues$
    ])
      .pipe(
        map(([value, queues]) => {
          if (!queues) {
            return [];
          }
          const name = (typeof value === 'string' ? value : value?.name).toLowerCase();
          if (this.queueControl.pristine || !name) {
            return queues;
          }
          return queues.filter(q => q.name.toLowerCase().includes(name));
        }),
      );
  }

  closeDialog(confirmed) {
    this.dialogRef.close({confirmed, queue: this.queueControl.value});
  }

  ngOnDestroy(): void {
    this.queuesSub.unsubscribe();
    this.store.dispatch(new SetTaskForEnqueue(null));
  }

}
