import {combineLatest, Observable, ObservableInput, ObservedValueOf} from 'rxjs';
import {selectIsExperimentInEditMode} from '../../webapp-common/experiments/reducers';
import {selectIsModelInEditMode} from '../../webapp-common/models/reducers';
import {Store} from '@ngrx/store';
import {debounceTime} from 'rxjs/operators';

export class GuardBase {
  public inEditMode$: Observable<[ObservedValueOf<ObservableInput<any>>, ObservedValueOf<ObservableInput<any>>]>;
  constructor(store: Store<any>) {
    this.inEditMode$ = combineLatest([
      store.select(selectIsExperimentInEditMode),
      store.select(selectIsModelInEditMode)
    ]).pipe(debounceTime(0));
  }
}
