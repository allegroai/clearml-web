import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {filter} from 'rxjs/operators';
import {Subscription, interval} from 'rxjs';
import {Store} from '@ngrx/store';
import {setCompareAutoRefresh} from '@common/core/actions/layout.actions';
import {selectCompareAutoRefresh} from '@common/core/reducers/view-reducer';

@Component({
  selector   : 'sm-experiment-refresh',
  templateUrl: './experiment-refresh.component.html',
  styleUrls  : ['./experiment-refresh.component.scss']
})
export class ExperimentRefreshComponent implements OnInit, OnDestroy {

  public autoRefreshValue            = false;
  private autoRefreshSubscription: Subscription;
  private autoRefreshValueSub: Subscription;
  readonly refreshInterval: number   = 30000;
  @Input() disabled                  = false;
  @Input() showSettings              = false;
  @Input() allowAutorefresh: boolean = true;
  @Output() onRefreshLogClicked      = new EventEmitter<{isAutoRefresh: boolean}>();
  @Output() toggleSettings           = new EventEmitter();

  constructor(private store: Store<any>) {
  }

  ngOnInit() {
    this.autoRefreshValueSub = this.store.select(selectCompareAutoRefresh)
      .subscribe(val => this.autoRefreshValue = val);

    this.autoRefreshSubscription = interval(this.refreshInterval)
      .pipe(
        filter(() => this.autoRefreshValue && this.allowAutorefresh)
      )
      .subscribe(() => this.onRefreshLogClicked.emit({isAutoRefresh: true}));
  }

  onAutoRefreshChange(event) {
    this.store.dispatch(setCompareAutoRefresh({autoRefresh: event.checked}));
  }

  ngOnDestroy(): void {
    this.autoRefreshSubscription.unsubscribe();
    this.autoRefreshValueSub.unsubscribe();
  }
}
