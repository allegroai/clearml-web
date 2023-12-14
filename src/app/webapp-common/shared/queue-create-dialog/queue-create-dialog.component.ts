import * as createNewQueueActions from './queue-create-dialog.actions';
import * as createQueueSelectors from './queue-create-dialog.reducer';

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {CREATION_STATUS} from './queue-create-dialog.reducer';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector   : 'sm-queue-create-dialog',
  templateUrl: './queue-create-dialog.component.html',
  styleUrls  : ['./queue-create-dialog.component.scss']
})
export class QueueCreateDialogComponent implements OnInit, OnDestroy {
  public queues$: Observable<any>;
  private creationStatusSubscription: Subscription;
  private editMode = false;
  public queue     = {name: null, id: null};

  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<QueueCreateDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    if (data) {
      this.queue    = data;
      this.editMode = true;
    }
    this.queues$ = this.store.select(createQueueSelectors.selectQueues);
  }

  ngOnInit(): void {
    this.store.dispatch(new createNewQueueActions.GetQueues());
    this.creationStatusSubscription = this.store.select(createQueueSelectors.selectCreationStatus).subscribe(status => {
      if (status === CREATION_STATUS.SUCCESS) {
        return this.matDialogRef.close(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new createNewQueueActions.ResetState());
    this.creationStatusSubscription.unsubscribe();
  }

  public createQueue(queue) {
    if (queue.id) {
      this.store.dispatch(new createNewQueueActions.UpdateQueue({queue: queue.id, name: queue.name}));
    } else {
      this.store.dispatch(new createNewQueueActions.CreateNewQueue(queue));
    }
  }

}
