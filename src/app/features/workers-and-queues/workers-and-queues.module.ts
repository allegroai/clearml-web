import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {WorkersAndQueuesRoutingModule} from '../../webapp-common/workers-and-queues/workers-and-queues-routing.module';
import {WorkersAndQueuesComponent} from '../../webapp-common/workers-and-queues/workers-and-queues.component';
import {WorkersComponent} from '../../webapp-common/workers-and-queues/containers/workers/workers.component';
import {QueuesComponent} from '../../webapp-common/workers-and-queues/containers/queues/queues.component';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {WorkersTableComponent} from '../../webapp-common/workers-and-queues/dumb/workers-table/workers-table.component';
import {QueueTaskTableComponent} from '../../webapp-common/workers-and-queues/dumb/queue-task-table/queue-task-table.component';
import {reducers} from '../../webapp-common/workers-and-queues/reducers/index.reducer';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {WorkersEffects} from '../../webapp-common/workers-and-queues/effects/workers.effects';
import {WorkersStatsComponent} from '../../webapp-common/workers-and-queues/containers/workers-stats/workers-stats.component';
import {WorkerInfoComponent} from '../../webapp-common/workers-and-queues/dumb/worker-info/worker-info.component';
import {AngularSplitModule} from 'angular-split';
import {QueuesTableComponent} from '../../webapp-common/workers-and-queues/dumb/queues-table/queues-table.component';
import {QueueInfoComponent} from '../../webapp-common/workers-and-queues/dumb/queue-info/queue-info.component';
import {QueuesEffect} from '../../webapp-common/workers-and-queues/effects/queues.effects';
import {SharedPipesModule} from '../../webapp-common/shared/pipes/shared-pipes.module';
import {QueueStatsComponent} from '../../webapp-common/workers-and-queues/containers/queue-stats/queue-stats.component';
import {SharedModule} from '../../shared/shared.module';
import {ExperimentSharedModule} from '../experiments/shared/experiment-shared.module';
import {QueueCreateDialogModule} from '../../webapp-common/shared/queue-create-dialog/queue-create-dialog.module';
import {SelectQueueModule} from '../../webapp-common/experiments/shared/components/select-queue/select-queue.module';
import {QueuesMenuComponent} from '../../webapp-common/workers-and-queues/dumb/queues-menu/queues-menu.component';
import {QueuesMenuExtendedComponent} from './queues-menu-extended/queues-menu-extended.component';

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
    FormsModule,
  ],
  declarations: [
    WorkersAndQueuesComponent,
    WorkersComponent,
    WorkersTableComponent,
    WorkersStatsComponent,
    WorkerInfoComponent,
    QueuesTableComponent,
    QueueTaskTableComponent,
    QueuesComponent,
    QueueInfoComponent,
    QueueStatsComponent,
    QueuesMenuComponent,
    QueuesMenuExtendedComponent
  ],

})
export class WorkersAndQueuesModule {
}
