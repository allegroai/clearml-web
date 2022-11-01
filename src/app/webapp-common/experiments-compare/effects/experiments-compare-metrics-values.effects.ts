import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as metricsValuesActions from '../actions/experiments-compare-metrics-values.actions';
import {activeLoader, deactivateLoader, setServerError} from '@common/core/actions/layout.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {requestFailed} from '../../core/actions/http.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';


@Injectable()
export class ExperimentsCompareMetricsValuesEffects {

  constructor(private actions$: Actions, public tasksApiService: ApiTasksService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(metricsValuesActions.getComparedExperimentsMetricsValues),
    map(action => activeLoader(action.type))
  ));

  getComparedExperimentsMetricsValues = createEffect(() => this.actions$.pipe(
    ofType(metricsValuesActions.getComparedExperimentsMetricsValues),
    mergeMap((action) => this.tasksApiService.tasksGetAllEx({
      id: action.taskIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
      only_fields: ['last_metrics', 'name', 'status', 'completed', 'last_update', 'last_iteration', 'project.name', 'tags']
    })
      .pipe(
        map(res => action.taskIds.map(id => res.tasks.find(ex => ex.id === id))),
        mergeMap(experiments => [
          metricsValuesActions.setComparedExperiments({experiments}),
          deactivateLoader(action.type)]),
        catchError(error => [
          requestFailed(error), deactivateLoader(action.type),
          setServerError(error, null, 'Failed to get Compared Experiments', action.autoRefresh)
        ])
      )
    )
  ));
}
