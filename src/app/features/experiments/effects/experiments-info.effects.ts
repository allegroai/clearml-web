import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentInfoState} from '../reducers/experiment-info.reducer';
import {map, withLatestFrom} from 'rxjs/operators';
import {selectExperimentInfoData, selectSelectedExperiment} from '../reducers';
import * as commonInfoActions from '../../../webapp-common/experiments/actions/common-experiments-info.actions';
import {ExperimentDataUpdated} from '../../../webapp-common/experiments/actions/common-experiments-info.actions';
import {CommonExperimentReverterService} from '../../../webapp-common/experiments/shared/services/common-experiment-reverter.service';


@Injectable()
export class ExperimentsInfoEffects {

  constructor(
    private actions$: Actions, private store: Store<IExperimentInfoState>,
    private commonReverter: CommonExperimentReverterService
  ) {}

  @Effect()
  populateFromModel$ = this.actions$.pipe(
    ofType<commonInfoActions.ModelSelected>(commonInfoActions.MODEL_SELECTED),
    withLatestFrom(this.store.select(selectSelectedExperiment), this.store.select(selectExperimentInfoData)),
    map(([action, experiment, infoData]) => {
      return new ExperimentDataUpdated({
        id     : experiment.id,
        changes: {
          model: {
            ...infoData.model,
            ...this.commonReverter.revertModelFromModel(action.payload.model, action.payload.fieldsToPopulate.networkDesign)
          }
        }
      }
      );
    })
  );

}
