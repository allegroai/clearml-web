import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentCompareDebugImagesState} from '../reducers/experiments-compare-debug-images.reducer';
import * as debugImagesActions from '../actions/experiments-compare-debug-images.actions';
import {activeLoader} from '../../../webapp-common/core/actions/layout.actions';
import {map} from 'rxjs/operators';


@Injectable()
export class ExperimentsCompareDebugImagesEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentCompareDebugImagesState>) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(debugImagesActions.SET_SOMETHING),
    map(action => activeLoader(action.type))
  );
}
