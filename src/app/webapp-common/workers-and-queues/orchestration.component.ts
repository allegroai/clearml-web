import {Component} from '@angular/core';
import {filter, take} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {getQueues} from '@common/workers-and-queues/actions/queues.actions';
import {Store} from '@ngrx/store';
import {QueueCreateDialogComponent} from '@common/shared/queue-create-dialog/queue-create-dialog.component';
import {ActivatedRoute} from '@angular/router';
import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';

@Component({
  selector: 'sm-orchestration',
  templateUrl: '../../features/workers-and-queues/orchestration.component.html',
  styleUrls: ['./orchestration.component.scss']
})
export class OrchestrationComponent {
  public queuesManager: boolean;
  featuresEnum = FeaturesEnum;

  constructor(private dialog: MatDialog, private store: Store, private route: ActivatedRoute) {
    this.queuesManager = route.snapshot.data.queuesManager;
  }

  addQueue() {

    this.dialog.open(QueueCreateDialogComponent)
      .afterClosed()
      .pipe(
        filter(queue => !!queue),
        take(1)
      )
      .subscribe(() => {
        this.store.dispatch(getQueues());
      });
  }

}
