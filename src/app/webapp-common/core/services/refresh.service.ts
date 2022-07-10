import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {selectAppVisible, selectAutoRefresh} from '@common/core/reducers/view.reducer';
import {interval, Subject} from 'rxjs';
import {AUTO_REFRESH_INTERVAL} from '~/app.constants';
import {filter, withLatestFrom} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private _tick = new Subject<boolean>();

  get tick() {
    return this._tick;
  }

  constructor(private store: Store) {
    interval(AUTO_REFRESH_INTERVAL)
      .pipe(
        withLatestFrom(
          this.store.select(selectAutoRefresh),
          this.store.select(selectAppVisible)
        ),
        filter(([, auto, visible]) => auto && visible)
      )
      .subscribe(() => this._tick.next(null));
  }

  trigger(auto = false) {
    this._tick.next(auto);
  }
}
