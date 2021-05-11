import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Worker} from '../../../../business-logic/model/workers/worker';
import {GetSelectedWorker, workersTableSortChanged} from '../../actions/workers.actions';
import {selectSelectedWorker, selectWorkers, selectWorkersTableSortFields} from '../../reducers/index.reducer';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {filter, take, withLatestFrom} from 'rxjs/operators';
import {SortMeta} from 'primeng/api';

@Component({
  selector: 'sm-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss']
})
export class WorkersComponent implements OnInit {

  public workers$: Observable<Worker[]>;
  public selectedWorker$: Observable<Worker>;
  public tableSortFields$: Observable<SortMeta[]>;

  get routerWorkerId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('id');
  }

  constructor(private store: Store<any>, private router: Router, private route: ActivatedRoute) {
    this.workers$ = this.store.select(selectWorkers);
    this.selectedWorker$ = this.store.select(selectSelectedWorker);
    this.tableSortFields$ = this.store.select(selectWorkersTableSortFields);
  }

  ngOnInit(): void {
    this.workers$.pipe(
      withLatestFrom(this.selectedWorker$),
      filter(([workers, selectedWorker]) => workers && selectedWorker?.id !== this.routerWorkerId),
      take(1))
      .subscribe(([workers]) => {
        const selectedWorker = workers.find(worker => worker.id === this.routerWorkerId);
        this.selectWorker(selectedWorker);
      });
  }


  public selectWorker(worker) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {id: worker?.id},
        queryParamsHandling: 'merge'
      });
    this.store.dispatch(new GetSelectedWorker(worker));
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(workersTableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }

}
