import {Component, inject, Input} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IRecentTask} from '../../common-dashboard.reducer';
import {getRecentExperiments} from '../../common-dashboard.actions';
import { ITask } from '~/business-logic/model/al-task';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';

@Component({
  selector: 'sm-dashboard-experiments',
  templateUrl: './dashboard-experiments.component.html',
  styleUrls: ['./dashboard-experiments.component.scss']
})
export class DashboardExperimentsComponent {
  private store = inject(Store);
  private router = inject(Router);
  @Input() recentTasks: IRecentTask[];

  constructor() {
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => this.store.dispatch((getRecentExperiments())));
  }

  public taskSelected(task: IRecentTask | ITask) {
    const projectId = task.project ? task.project.id : '*';
    return this.router.navigate(['projects', projectId, 'experiments', task.id]);
  }

}
