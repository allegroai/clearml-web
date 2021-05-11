import {Component} from '@angular/core';
import {filter, take} from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {getQueues} from './actions/queues.actions';
import {Store} from '@ngrx/store';
import {QueueCreateDialogComponent} from '../shared/queue-create-dialog/queue-create-dialog.component';

@Component({
  selector   : 'sm-workers-and-queues',
  templateUrl: './workers-and-queues.component.html',
  styleUrls  : ['./workers-and-queues.component.scss']
})
export class WorkersAndQueuesComponent {
  private createQueueDialog: MatDialogRef<any, any>;

  constructor(private dialog: MatDialog, private store: Store<any>) {

  }

  addQueue() {

    this.createQueueDialog = this.dialog.open(QueueCreateDialogComponent);
    this.createQueueDialog.afterClosed()
      .pipe(
        filter(queue => !!queue),
        take(1)
      )
      .subscribe((queue) => {
        this.store.dispatch(getQueues());
      });
  }

}
