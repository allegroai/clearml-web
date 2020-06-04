import {Component, OnDestroy} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Worker} from '../../../../business-logic/model/workers/worker';
import {GetSelectedWorker, WorkersTableSortChanged} from '../../actions/workers.actions';
import {selectSelectedWorker, selectWorkers, selectWorkersTableSortField, selectWorkersTableSortOrder} from '../../reducers/index.reducer';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {ISmCol, TableSortOrderEnum} from '../../../shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss']
})
export class WorkersComponent implements OnDestroy {

  public workers$: Observable<Array<Worker>>;
  public selectedWorker$: Observable<Worker>;
  public tableSortOrder$: Observable<1 | -1>;
  public tableSortField$: Observable<string>;

  constructor(private store: Store<any>, private router: Router) {
    this.workers$ = this.store.pipe(select(selectWorkers));
    this.selectedWorker$ = this.store.pipe(select(selectSelectedWorker));
    this.tableSortOrder$ = this.store.select(selectWorkersTableSortOrder);
    this.tableSortField$ = this.store.select(selectWorkersTableSortField);
  }


  public selectWorker(worker) {
    this.store.dispatch(new GetSelectedWorker(worker));
  }

  sortedChanged(sort: { sortOrder: TableSortOrderEnum, colId: ISmCol['id'] }) {
    this.store.dispatch(new WorkersTableSortChanged(sort.colId, sort.sortOrder));
  }

  ngOnDestroy(): void {
    this.selectWorker(null);
  }
}
