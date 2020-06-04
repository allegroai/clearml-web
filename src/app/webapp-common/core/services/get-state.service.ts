import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {take} from 'rxjs/operators';

@Injectable()
export class SmGetStateService {

  constructor(private store: Store<any>) {}

  getState() {
    let _state: any;
    this.store.pipe(take(1)).subscribe(o => _state = o);

    return _state;
  }

}
