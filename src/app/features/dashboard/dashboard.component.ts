import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectActiveSearch} from '../../webapp-common/search/common-search-results.reducer';
import {Router} from '@angular/router';

@Component({
  selector   : 'sm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls  : ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public activeSearch$: Observable<boolean>;


  constructor(private store: Store<any>, private router: Router) {
    this.activeSearch$ = this.store.select(selectActiveSearch);

  }
  public redirectToWorkers() {
    this.router.navigateByUrl('/workers-and-queues');
  }

  public ngOnInit(): void {

  }
}
