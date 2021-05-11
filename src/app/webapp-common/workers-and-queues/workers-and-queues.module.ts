import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WorkersAndQueuesRoutingModule} from './workers-and-queues-routing.module';
import {WorkersAndQueuesComponent} from './workers-and-queues.component';
import {WorkersComponent} from './containers/workers/workers.component';
import {QueuesComponent} from './containers/queues/queues.component';
import {SMSharedModule} from '../shared/shared.module';
import {WorkersTableComponent} from './dumb/workers-table/workers-table.component';
import {QueueTaskTableComponent} from './dumb/queue-task-table/queue-task-table.component';
import {reducers} from './reducers/index.reducer';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {WorkersEffects} from './effects/workers.effects';
import {WorkersStatsComponent} from './containers/workers-stats/workers-stats.component';
import {WorkerInfoComponent} from './dumb/worker-info/worker-info.component';
import {AngularSplitModule} from 'angular-split';
import {QueuesTableComponent} from './dumb/queues-table/queues-table.component';
import {QueueInfoComponent} from './dumb/queue-info/queue-info.component';
import {QueuesEffect} from './effects/queues.effects';
import {SharedPipesModule} from '../shared/pipes/shared-pipes.module';
import {QueueStatsComponent} from './containers/queue-stats/queue-stats.component';
import {SharedModule} from '../../shared/shared.module';
import {ExperimentSharedModule} from '../../features/experiments/shared/experiment-shared.module';
import {QueueCreateDialogModule} from '../shared/queue-create-dialog/queue-create-dialog.module';
import {SelectQueueModule} from '../experiments/shared/components/select-queue/select-queue.module';
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        ExperimentSharedModule,
        SharedPipesModule,
        CommonModule,
        WorkersAndQueuesRoutingModule,
        SharedModule,
        SMSharedModule,
        QueueCreateDialogModule,
        SelectQueueModule,
        StoreModule.forFeature('workersAndQueues', reducers),
        EffectsModule.forFeature([WorkersEffects, QueuesEffect]),
        AngularSplitModule,
        FormsModule
    ],
  declarations: [
    WorkersAndQueuesComponent,
    WorkersComponent,
    WorkersTableComponent,
    QueuesTableComponent,
    QueueTaskTableComponent,
    QueuesComponent,
    WorkersStatsComponent,
    WorkerInfoComponent,
    QueueInfoComponent,
    QueueStatsComponent
  ],

})
export class WorkersAndQueuesModule {
}
