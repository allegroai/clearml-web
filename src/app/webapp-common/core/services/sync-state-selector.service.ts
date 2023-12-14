import {Injectable} from '@angular/core';
import {select, Selector, Store} from '@ngrx/store';
import {take} from 'rxjs/operators';

@Injectable()
export class SmSyncStateSelectorService {

  constructor(private store: Store<any>) {
  }

  selectSync(selector: Selector<any, any>) {
    let entity: any;
    this.store.pipe(
      select(selector),
      take(1))
      .subscribe(o => entity = o);

    return entity;
  }

}
