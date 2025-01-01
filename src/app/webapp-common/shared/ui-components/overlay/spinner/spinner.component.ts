import {Store} from '@ngrx/store';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {selectLoading} from '@common/core/reducers/view.reducer';
import {NavigationStart, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {resetLoader} from '@common/core/actions/layout.actions';
import {Observable, Subscription} from 'rxjs';
import {isEqual} from 'lodash-es';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  selector: 'sm-spinner',
  template: `
    @if (showSpinner) {
      <div class="loader-container">
        <mat-spinner [diameter]="64" [strokeWidth]="6" color="accent"></mat-spinner>
      </div>
    }
    `,
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatProgressSpinnerModule
]
})
export class SpinnerComponent implements OnInit, OnDestroy {
  public showSpinner: boolean;
  private spinnerSubscribe: Subscription;
  private navEndSubscription: Subscription;
  private loading$: Observable<{ [p: string]: boolean }>;

  constructor(private store: Store, private router: Router, private cdr: ChangeDetectorRef) {
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
