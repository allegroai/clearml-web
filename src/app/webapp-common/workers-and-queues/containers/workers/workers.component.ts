import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getSelectedWorker, workersTableSortChanged} from '../../actions/workers.actions';
import {selectSelectedWorker, selectWorkers, selectWorkersTableSortFields} from '../../reducers/index.reducer';
import {ActivatedRoute, Router} from '@angular/router';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {filter, take, withLatestFrom} from 'rxjs/operators';

@Component({
  selector: 'sm-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss']
})
export class WorkersComponent implements OnInit {

  public workers$ = this.store.select(selectWorkers);
  public selectedWorker$ = this.store.select(selectSelectedWorker);
  public tableSortFields$ = this.store.select(selectWorkersTableSortFields);

  get routerWorkerId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('id');
  }

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
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
    this.store.dispatch(getSelectedWorker({worker}));
    return this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {id: worker?.id},
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(workersTableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }


}
