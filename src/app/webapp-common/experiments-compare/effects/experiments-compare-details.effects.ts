import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {select, Store} from '@ngrx/store';
import {IExperimentCompareDetailsState} from '../reducers/experiments-compare-details.reducer';
import * as detailsActions from '../actions/experiments-compare-details.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {catchError, flatMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ExperimentDetailsReverterService} from '../services/experiment-details-reverter.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {selectExperimentIds, selectExperimentsDetails} from '../reducers';
import {Observable, of} from 'rxjs';
import {EXPERIMENT_INFO_ONLY_FIELDS} from '../../../features/experiments-compare/experiments-compare-consts';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';
import {refetchExperimentRequested, setRefreshing} from '../actions/compare-header.actions';

@Injectable()
export class ExperimentsCompareDetailsEffects {

  constructor(private actions$: Actions, private tasksApi: ApiTasksService, private store: Store<IExperimentCompareDetailsState>,
              private experimentDetailsReverter: ExperimentDetailsReverterService
  ) {
  }

  @Effect()
  activeLoader$ = this.actions$.pipe(
    ofType(detailsActions.EXPERIMENT_LIST_UPDATED, detailsActions.REFETCH_EXPERIMENT_REQUESTED),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  UpdateExperimentsDetail$ = this.actions$.pipe(
    ofType<detailsActions.ExperimentListUpdated>(detailsActions.EXPERIMENT_LIST_UPDATED),
    withLatestFrom(this.store.pipe(select(selectExperimentIds))),
    map(([action, oldExperimentIds]) => [action, action.payload.filter(id => !oldExperimentIds.includes(id))]),
    switchMap(([action, newExperimentIds]: [detailsActions.ExperimentListUpdated, Array<string>]) =>
      this.fetchExperimentDetails$(newExperimentIds)
        .pipe(
          withLatestFrom(this.store.pipe(select(selectExperimentsDetails))),
          // get only the relevant experiments
          map(([experiments, oldExperiments]) => oldExperiments.filter(exp => action.payload.includes(exp.id)).concat(experiments)),
          flatMap(experiments => [
            new DeactiveLoader(action.type),
            new detailsActions.SetExperiments(experiments)
          ]),
          catchError(error => {
            return [
              new RequestFailed(error),
              new DeactiveLoader(action.type),
              new SetServerError(error, null, 'The attempt to retrieve your experiment data failed. Refresh your browser and try again.')
            ];
          })
        )
    )
  );

  @Effect()
  RefetchExperiment$ = this.actions$.pipe(
    ofType(refetchExperimentRequested),
    withLatestFrom(this.store.select(selectExperimentIds)),
    switchMap(([action, newExperimentIds]) =>
      this.fetchExperimentDetails$(newExperimentIds).pipe(
        flatMap(experiments => [
          new DeactiveLoader(action.type),
          setRefreshing({payload: false}),
          new detailsActions.SetExperiments(experiments)
        ]),
        catchError(error => {
          return [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            setRefreshing({payload: false}),
            new SetServerError(
              error, null,
              'The attempt to retrieve your experiment data failed. Refresh your browser and try again.',
              action.autoRefresh
            )
          ];
        })
      )),
  );

  fetchExperimentDetails$(ids): Observable<Array<IExperimentDetail>> {
    return ids.length > 0 ?
      this.tasksApi.tasksGetAllEx({
        id         : ids,
        only_fields: EXPERIMENT_INFO_ONLY_FIELDS
      }).pipe(
        map(res => this.experimentDetailsReverter.revertExperiments(ids, res.tasks))
      )
      : of([]);
  }


}

