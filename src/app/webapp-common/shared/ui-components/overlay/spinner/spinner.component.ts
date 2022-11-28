import {Store} from '@ngrx/store';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {selectLoading} from '@common/core/reducers/view.reducer';
import {NavigationStart, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {resetLoader} from '@common/core/actions/layout.actions';
import {Observable, Subscription} from 'rxjs';
import {isEqual} from 'lodash/fp';

@Component({
  selector: 'sm-spinner',
  template: `
    <div *ngIf="showSpinner">
      <div class="loader-container">
        <div class="circle"></div>
      </div>
      <!--<div class="spinner-overlay"></div>-->
    </div>
  `,
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent implements OnInit, OnDestroy {
  public showSpinner: boolean;
  private spinnerSubscribe: Subscription;
  private navEndSubscription: Subscription;
  private loading$: Observable<{ [p: string]: boolean }>;

  constructor(private store: Store<any>, private router: Router, private cdr: ChangeDetectorRef) {
    this.loading$ = store.select(selectLoading);

  }

  ngOnInit() {
    this.spinnerSubscribe = this.loading$.pipe(
      debounceTime(300),
      distinctUntilChanged(isEqual)
    ).subscribe(loaders => {
        this.showSpinner = Object.values(loaders).some((value) => value);
        this.cdr.detectChanges();
    });

    this.navEndSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        map((event: NavigationStart) => event.url.split('?')[0]),
        distinctUntilChanged()
      ).subscribe(() => {
        this.store.dispatch(resetLoader());
      });
  }

  ngOnDestroy(): void {
    this.navEndSubscription.unsubscribe();
    this.spinnerSubscribe.unsubscribe();
  }
}
