import {Store} from '@ngrx/store';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectLoading} from '@common/core/reducers/view-reducer';
import {NavigationStart, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {resetLoader} from '@common/core/actions/layout.actions';
import {Subscription} from 'rxjs';

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
  styleUrls: ['./spinner.component.scss']

})
export class SpinnerComponent implements OnInit, OnDestroy {
  showSpinner: boolean;
  private spinnerSubscribe: Subscription;
  private navEndSubscription: Subscription;

  constructor(private store: Store<any>, private router: Router) {
    this.spinnerSubscribe = store.select(selectLoading)
      .pipe(
        debounceTime(300)
      ).subscribe(loaders => this.showSpinner = Object.entries(loaders).some(([, value]) => !!value));
  }

  ngOnInit() {
    this.navEndSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        map((event: NavigationStart) => event.url.split('?')[0]),
        distinctUntilChanged()
      ).subscribe(() => this.store.dispatch(resetLoader()));
  }

  ngOnDestroy(): void {
    this.navEndSubscription.unsubscribe();
    this.spinnerSubscribe.unsubscribe();
  }
}
