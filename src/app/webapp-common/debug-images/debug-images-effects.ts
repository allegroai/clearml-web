import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, mergeMap, map, switchMap, withLatestFrom, filter} from 'rxjs/operators';
import * as  debugActions from './debug-images-actions';
import {activeLoader, deactivateLoader} from '../core/actions/layout.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {requestFailed} from '../core/actions/http.actions';
import {refreshExperiments} from '../experiments/actions/common-experiments-view.actions';
import {Action, Store} from '@ngrx/store';
import {selectDebugImages} from './debug-images-reducer';
import {EventsDebugImagesResponse} from '~/business-logic/model/events/eventsDebugImagesResponse';
import {EventsGetTaskMetricsResponse} from '~/business-logic/model/events/eventsGetTaskMetricsResponse';
import {COMPARE_DEBUG_IMAGES_ONLY_FIELDS} from '../experiments-compare/experiments-compare.constants';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';
import {setBeginningOfTime} from '@common/shared/debug-sample/debug-sample.actions';

export const ALL_IMAGES = '-- All --';

export const removeAllImagesFromPayload = (payload) =>
  ({...payload, metric: payload.metric === ALL_IMAGES ? null : payload.metric});


// interface Image {
//   timestamp: number;
//   type?: string;
//   task?: string;
//   iter?: number;
//   metric?: string;
//   variant?: string;
//   key?: string;
//   url?: string;
//   '@timestamp'?: string;
//   worker?: string;
// }


@Injectable()
export class DebugImagesEffects {

  constructor(
    private actions$: Actions, private apiTasks: ApiTasksService,
    private eventsApi: ApiEventsService, private store: Store<any>
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(debugActions.fetchExperiments, debugActions.refreshMetric, debugActions.refreshDebugImagesMetrics),
    filter(action => !(action as any).autoRefresh),
    map(action => activeLoader(action.type))
  ));


  fetchDebugImages$ = createEffect(() => this.actions$.pipe(
    ofType(debugActions.setSelectedMetric, debugActions.getNextBatch, debugActions.getPreviousBatch, debugActions.refreshMetric),
    withLatestFrom(this.store.select(selectDebugImages)),
    mergeMap(([action, debugImages]) =>
      this.eventsApi.eventsDebugImages({
        /* eslint-disable @typescript-eslint/naming-convention */
        metrics: [removeAllImagesFromPayload(action.payload)],
        iters: 3,
        scroll_id: (action.type !== debugActions.setSelectedMetric.type && debugImages?.[action.payload.task]) ?
          debugImages[action.payload.task].scroll_id :
          null,
        navigate_earlier: action.type !== debugActions.getPreviousBatch.type,
        refresh: [debugActions.setSelectedMetric.type, debugActions.refreshMetric.type].includes(action.type)
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap((res: EventsDebugImagesResponse) => {
            const actionsToShoot = [deactivateLoader(action.type)] as Action[];
            if (res.metrics[0].iterations && res.metrics[0].iterations.length > 0) {
              actionsToShoot.push(debugActions.setDebugImages({res, task: action.payload.task}));
              switch (action.type) {
                case debugActions.getNextBatch.type:
                  actionsToShoot.push(debugActions.setTimeIsNow({task: action.payload.task, timeIsNow: false}));
                  break;
                case debugActions.setSelectedMetric.type:
                  actionsToShoot.push(debugActions.setTimeIsNow({task: action.payload.task, timeIsNow: true}));
                  break;
                case debugActions.getPreviousBatch.type:
                  actionsToShoot.push(setBeginningOfTime({
                    task: action.payload.task,
                    beginningOfTime: false
                  }));
                  break;
              }
            } else {
              switch (action.type) {
                case debugActions.getNextBatch.type:
                  actionsToShoot.push(setBeginningOfTime({
                    task: action.payload.task,
                    beginningOfTime: true
                  }));
                  break;
                case debugActions.getPreviousBatch.type:
                  actionsToShoot.push(debugActions.setTimeIsNow({task: action.payload.task, timeIsNow: true}));
                  break;
              }
            }
            return actionsToShoot;
          }),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            deactivateLoader(refreshExperiments.type)
          ])
        )
    )
  ));

  fetchExperiments$ = createEffect(() => this.actions$.pipe(
    ofType(debugActions.fetchExperiments),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap((action) => this.apiTasks.tasksGetAllEx({id: action.tasks, only_fields: COMPARE_DEBUG_IMAGES_ONLY_FIELDS})
      .pipe(
        mergeMap(res => [debugActions.setExperimentsNames({tasks: res.tasks}), deactivateLoader(action.type)]),
        catchError(error => [requestFailed(error), deactivateLoader(action.type)])
      )
    )
  ));


  fetchMetrics$ = createEffect(() => this.actions$.pipe(
    ofType(debugActions.getDebugImagesMetrics, debugActions.refreshDebugImagesMetrics),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
    switchMap((action) => this.eventsApi.eventsGetTaskMetrics({
        /* eslint-disable @typescript-eslint/naming-convention */
        tasks: action.tasks,
        event_type: 'training_debug_image'
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap((res: EventsGetTaskMetricsResponse) => [debugActions.setMetrics({metrics: res.metrics}), deactivateLoader(action.type)]),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  ));
}
