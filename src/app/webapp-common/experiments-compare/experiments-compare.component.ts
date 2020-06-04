import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRouterQueryParams} from '../core/reducers/router-reducer';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {selectNavigationPreferences} from './reducers';
import {debounceTime} from 'rxjs/operators';
import {setNavigationPreferences} from './actions/compare-header.actions';

@Component({
  selector: 'sm-experiments-compare',
  templateUrl: './experiments-compare.component.html',
  styleUrls: ['./experiments-compare.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsCompareComponent implements OnInit, OnDestroy {
  private queryParams$: Subscription;
  private navigationPreferences$: Subscription;
  private queryParams: Params;

  constructor(private store: Store<any>, private router: Router, private activatedRoute: ActivatedRoute) {
    // updating URL with store query params
    this.navigationPreferences$ = this.store.select(selectNavigationPreferences).pipe(debounceTime(10)).subscribe((queryParams) => {
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams,
          queryParamsHandling: 'merge'
        });
    });

    this.queryParams$ = this.store.select(selectRouterQueryParams).subscribe((queryParams) => this.queryParams = queryParams);
  }

  ngOnDestroy(): void {
    this.queryParams$.unsubscribe();
    this.navigationPreferences$.unsubscribe();
  }

  ngOnInit(): void {
    // Update store with url query params on load
    this.store.dispatch(setNavigationPreferences({navigationPreferences: this.queryParams}));
  }
}
