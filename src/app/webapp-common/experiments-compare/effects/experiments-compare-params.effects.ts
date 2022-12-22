import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {select, Store} from '@ngrx/store';
import * as paramsActions from '../actions/experiments-compare-params.actions';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {catchError, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ExperimentParamsReverterService} from '../services/experiment-params-reverter.service';
import {requestFailed} from '../../core/actions/http.actions';
import {selectExperimentIdsParams, selectExperimentsParams} from '../reducers';
import {Observable, of} from 'rxjs';
import {COMPARE_PARAMS_ONLY_FIELDS} from '~/features/experiments-compare/experiments-compare-consts';
import {IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {REFETCH_EXPERIMENT_REQUESTED, refetchExperimentRequested} from '../actions/compare-header.actions';
import {ExperimentCompareParamsState} from '../reducers/experiments-compare-params.reducer';
import {setExperiments} from '../actions/experiments-compare-params.actions';
import {ExperimentDetailBase, ExperimentParams} from '../shared/experiments-compare-details.model';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';

@Injectable()
export class ExperimentsCompareParamsEffects {

  constructor(private actions$: Actions, private tasksApi: ApiTasksService, private store: Store<ExperimentCompareParamsState>,
              private experimentParamsReverter: ExperimentParamsReverterService
  ) {
  }

  activeLoader$ = createEffect(() => this.actions$.pipe(
    ofType(paramsActions.experimentListUpdated, REFETCH_EXPERIMENT_REQUESTED),
    map(action => activeLoader(action.type))
  ));

  updateExperimentsList$ = createEffect(() => this.actions$.pipe(
    ofType(paramsActions.experimentListUpdated),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
    withLatestFrom(this.store.pipe(select(selectExperimentIdsParams))),
    switchMap(([action, oldExperimentIds]) => {
      const newExperimentIds = action.ids.filter(id => !oldExperimentIds.includes(id));
      return this.fetchExperimentParams$(newExperimentIds)
        .pipe(
          withLatestFrom(this.store.pipe(select(selectExperimentsParams))),
          // get only the relevant experiments
          map(([experiments, oldExperiments]: [ExperimentDetailBase[], ExperimentParams[]]) =>
            oldExperiments.filter(exp => action.ids.includes(exp.id)).concat(experiments as ExperimentParams[])),
          map(experiments=> action.ids.map(id=> experiments.find(experiment=> experiment.id===id))),
          mergeMap(experiments => [
            deactivateLoader(action.type),
            setExperiments({experiments})
          ]),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, 'The attempt to retrieve your experiment data failed. Refresh your browser and try again.')
          ]
          )
        );
    }
    )
  ));

  refetchExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(refetchExperimentRequested),
    withLatestFrom(this.store.select(selectExperimentIdsParams)),
    switchMap(([action, newExperimentIds]) =>
      this.fetchExperimentParams$(newExperimentIds).pipe(
        mergeMap(experiments => [
          deactivateLoader(action.type),
          setExperiments({experiments : experiments as ExperimentParams[]})
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(
            error, null,
            'The attempt to retrieve your experiment data failed. Refresh your browser and try again.',
            action.autoRefresh
          )
        ])
      )),
  ));

  fetchExperimentParams$(ids): Observable<Array<IExperimentDetail>> {
    return ids.length > 0 ?
      this.tasksApi.tasksGetAllEx({
        id: ids,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: COMPARE_PARAMS_ONLY_FIELDS
      })
        .pipe(map(res => this.experimentParamsReverter.revertExperiments(ids, res.tasks)))
      : of([]);
  }
}

