import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IRecentTask} from '../../common-dashboard.reducer';
import {GetRecentTasks} from '../../common-dashboard.actions';
import { ITask } from '../../../../business-logic/model/al-task';
import {selectCurrentUser} from '../../../core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';

@Component({
  selector: 'sm-dashboard-experiments',
  templateUrl: './dashboard-experiments.component.html',
  styleUrls: ['./dashboard-experiments.component.scss']
})
export class DashboardExperimentsComponent implements OnInit {
  @Input() recentTasks: IRecentTask[];

  constructor(private store: Store<any>, private router: Router) {
  }

  ngOnInit() {
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => this.store.dispatch(new GetRecentTasks()));
  }

  public taskSelected(task: IRecentTask | ITask) {
    // TODO ADD task.id to route
    const projectId = task.project ? task.project.id : '*';
    return this.router.navigateByUrl('projects/' + projectId + '/experiments/' + task.id);
  }

}
