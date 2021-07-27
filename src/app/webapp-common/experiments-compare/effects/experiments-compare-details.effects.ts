import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {select, Store} from '@ngrx/store';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {catchError, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ExperimentDetailsReverterService} from '../services/experiment-details-reverter.service';
import {requestFailed} from '../../core/actions/http.actions';
import {selectExperimentIdsDetails, selectExperimentsDetails} from '../reducers';
import {Observable, of} from 'rxjs';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';
import {REFETCH_EXPERIMENT_REQUESTED, refetchExperimentRequested, setRefreshing} from '../actions/compare-header.actions';
import {ExperimentCompareDetailsState} from '../reducers/experiments-compare-details.reducer';
import {experimentListUpdated, setExperiments} from '../actions/experiments-compare-details.actions';
import {getCompareDetailsOnlyFields} from '../../../features/experiments-compare/experiments-compare-consts';
import {selectHasDataFeature} from '../../../core/reducers/users.reducer';

@Injectable()
export class ExperimentsCompareDetailsEffects {

  constructor(private actions$: Actions, private tasksApi: ApiTasksService, private store: Store<ExperimentCompareDetailsState>,
              private experimentDetailsReverter: ExperimentDetailsReverterService
  ) {
  }

  activeLoader$ = createEffect( () => this.actions$.pipe(
    ofType(experimentListUpdated, REFETCH_EXPERIMENT_REQUESTED),
    map(action => activeLoader(action.type))
  ));

  updateExperimentsDetail$ = createEffect( () => this.actions$.pipe(
    ofType(experimentListUpdated),
    withLatestFrom(
      this.store.pipe(select(selectExperimentIdsDetails)),
      this.store.select(selectHasDataFeature)
    ),
    switchMap(([action, oldExperimentIds, hasDataFeature]) => {
      const newExperimentIds = action.ids.filter(id => !oldExperimentIds.includes(id));
      return this.fetchExperimentDetails$(newExperimentIds, hasDataFeature)
        .pipe(
          withLatestFrom(this.store.pipe(select(selectExperimentsDetails))),
          // get only the relevant experiments
          map(([experiments, oldExperiments]) => oldExperiments.filter(exp => action.ids.includes(exp.id)).concat(experiments)),
          mergeMap(experiments => [
            deactivateLoader(action.type),
            setExperiments({experiments})
          ]),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, 'The attempt to retrieve your experiment data failed. Refresh your browser and try again.')
          ])
        );
    })
  ));

  refetchExperimentEffect$ = createEffect( () => this.actions$.pipe(
    ofType(refetchExperimentRequested),
    withLatestFrom(this.store.select(selectExperimentIdsDetails), this.store.select(selectHasDataFeature)),
    switchMap(([action, newExperimentIds, hasDataFeature]) =>
      this.fetchExperimentDetails$(newExperimentIds, hasDataFeature).pipe(
        mergeMap(experiments => [
          deactivateLoader(action.type),
          setRefreshing({payload: false}),
          setExperiments({experiments})
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setRefreshing({payload: false}),
          setServerError(
            error, null,
            'The attempt to retrieve your experiment data failed. Refresh your browser and try again.',
            action.autoRefresh
          )
        ])
      )),
  ));

  fetchExperimentDetails$(ids, hasDataFeature: boolean): Observable<Array<IExperimentDetail>> {
    return ids.length > 0 ?
      this.tasksApi.tasksGetAllEx({
        id: ids,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: getCompareDetailsOnlyFields(hasDataFeature)
      }).pipe(
        map(res => this.experimentDetailsReverter.revertExperiments(ids, res.tasks))
      )
      : of([]);
  }
}

