import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {WorkersAndQueuesComponent} from './workers-and-queues.component';
import {WorkersComponent} from './containers/workers/workers.component';
import {QueuesComponent} from './containers/queues/queues.component';

export const routes: Routes = [
  {
    path: '',
    component: WorkersAndQueuesComponent,
    children: [
      {path: '', redirectTo: 'workers'},
      {path: 'workers', component: WorkersComponent},
      {path: 'queues', component: QueuesComponent},
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

