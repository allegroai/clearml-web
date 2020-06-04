import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IRecentTask, selectRecentTasks } from '../../common-dashboard.reducer';
import { GetRecentTasks } from '../../common-dashboard.actions';
import { ITask } from '../../../../business-logic/model/al-task';

@Component({
  selector: 'sm-dashboard-experiments',
  templateUrl: './dashboard-experiments.component.html',
  styleUrls: ['./dashboard-experiments.component.scss']
})
export class DashboardExperimentsComponent implements OnInit {
  public recentTasks$: Observable<Array<IRecentTask>>;

  constructor(private store: Store<any>, private router: Router) {
    this.recentTasks$ = this.store.select(selectRecentTasks);
  }

  ngOnInit() {
    this.store.dispatch(new GetRecentTasks());
  }

  public taskSelected(task: IRecentTask | ITask) {
    // TODO ADD task.id to route
    const projectId = task.project ? task.project.id : '*';
    this.router.navigateByUrl('projects/' + projectId + '/experiments/' + task.id);
  }

}
