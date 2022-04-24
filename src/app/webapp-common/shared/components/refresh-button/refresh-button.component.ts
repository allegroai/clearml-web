import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RefreshService} from '@common/core/services/refresh.service';
import {Store} from '@ngrx/store';
import {selectAutoRefresh} from '@common/core/reducers/view.reducer';
import {Observable} from 'rxjs';

@Component({
  selector   : 'sm-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls  : ['./refresh-button.component.scss']
})
export class RefreshButtonComponent {
  @Input() allowAutoRefresh: boolean = true;
  @Input() disabled: boolean = true;
  @Output() setAutoRefresh = new EventEmitter<boolean>();

  autoRefreshState$: Observable<boolean>;

  constructor(public refresh: RefreshService, private store: Store) {
    this.autoRefreshState$ = store.select(selectAutoRefresh);
  }
}

