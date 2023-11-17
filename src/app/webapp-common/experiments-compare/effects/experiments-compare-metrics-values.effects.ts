import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as metricsValuesActions from '../actions/experiments-compare-metrics-values.actions';
import {activeLoader, deactivateLoader, setServerError} from '@common/core/actions/layout.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {requestFailed} from '../../core/actions/http.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {ModelsGetAllExResponse} from '~/business-logic/model/models/modelsGetAllExResponse';


@Injectable()
export class ExperimentsCompareMetricsValuesEffects {

  constructor(private actions$: Actions, public tasksApiService: ApiTasksService, private modelsApi: ApiModelsService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(metricsValuesActions.getComparedExperimentsMetricsValues),
    map(action => activeLoader(action.type))
  ));

  getComparedExperimentsMetricsValues = createEffect(() => this.actions$.pipe(
    ofType(metricsValuesActions.getComparedExperimentsMetricsValues),
    mergeMap((action) => this.fetchEntities$(action)
      .pipe(
        map(res => action.taskIds.map(id => res[action.entity === EntityTypeEnum.model ? 'models' : 'tasks'].find(ex => ex.id === id)).filter(ex => !!ex)),
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

  fetchEntities$(action) {
    return action.entity === EntityTypeEnum.model ? this.modelsApi.modelsGetAllEx({
        id: action.taskIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['last_metrics', 'name', 'last_update', 'last_iteration', 'last_iteration', 'project.name', 'tags', 'ready']
      }).pipe(map((res: ModelsGetAllExResponse) => ({models: res.models.map(model => ({...model, status: model.ready ? 'Ready' : 'Draft'}))})))
      : this.tasksApiService.tasksGetAllEx({
        id: action.taskIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['last_metrics', 'name', 'status', 'completed', 'last_update', 'last_iteration', 'project.name', 'tags']
      });
  }
}
