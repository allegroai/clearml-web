import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {WorkersAndQueuesComponent} from './workers-and-queues.component';
import {WorkersComponent} from './containers/workers/workers.component';
import {QueuesComponent} from './containers/queues/queues.component';
import {WorkersAndQueuesResolver} from '../../shared/resolvers/workers-and-queues.resolver';

export const routes: Routes = [
  {
    path: '',
    component: WorkersAndQueuesComponent,
    resolve: {
      queuesManager: WorkersAndQueuesResolver
    },
    children: [
      {path: '', redirectTo: 'workers'},
      {path: 'workers', component: WorkersComponent},
      {path: 'queues',
        component: QueuesComponent,
        resolve: {
          queuesManager: WorkersAndQueuesResolver
        },},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class WorkersAndQueuesRoutingModule {
}

