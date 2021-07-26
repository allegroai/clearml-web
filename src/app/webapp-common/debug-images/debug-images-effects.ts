import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import * as  debugActions from './debug-images-actions';
import {activeLoader, deactivateLoader} from '../core/actions/layout.actions';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiEventsService} from '../../business-logic/api-services/events.service';
import {requestFailed} from '../core/actions/http.actions';
import {refreshExperiments} from '../experiments/actions/common-experiments-view.actions';
import {setRefreshing} from '../experiments-compare/actions/compare-header.actions';
import {Action, Store} from '@ngrx/store';
import {selectDebugImages, selectImageViewerScrollId} from './debug-images-reducer';
import {
  setCurrentDebugImage,
  setDebugImageIterations,
  setDebugImageViewerScrollId,
  setDisplayerBeginningOfTime, setDisplayerEndOfTime
} from './debug-images-actions';

export const ALL_IMAGES = '-- All --';

export const removeAllImagesFromPayload = (payload) => {
  return {...payload, metric: payload.metric === ALL_IMAGES ? null : payload.metric};
};

interface Image {
  timestamp: number;
  type?: string;
  task?: string;
  iter?: number;
  metric?: string;
  variant?: string;
  key?: string;
  url?: string;
  '@timestamp'?: string;
  worker?: string;
}


@Injectable()
export class DebugImagesEffects {
  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(debugActions.FETCH_EXPERIMENTS),
    map(action => activeLoader(action.type))
  );


  @Effect()
  fetchDebugImages$ = this.actions$.pipe(
    ofType<debugActions.SelectMetric | debugActions.GetNextBatch | debugActions.GetPreviousBatch | debugActions.RefreshMetric>
    (debugActions.SET_DEBUG_IMAGES_SELECTED_METRIC, debugActions.GET_NEXT_DEBUG_IMAGES_BATCH, debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH, debugActions.REFRESH_IMAGES_SELECTED_METRIC),
    withLatestFrom(this.store.select(selectDebugImages)),
    mergeMap(([action, debugImages]) =>
      this.eventsApi.eventsDebugImages({
        metrics: [removeAllImagesFromPayload(action.payload)],
        iters: 3,
        scroll_id: debugImages[action.payload.task] ? debugImages[action.payload.task].scroll_id : null,
        navigate_earlier: action.type !== debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH,
        refresh: [debugActions.SET_DEBUG_IMAGES_SELECTED_METRIC, debugActions.REFRESH_IMAGES_SELECTED_METRIC].includes(action.type)
      })
        .pipe(
          mergeMap((res: any) => {
            const actionsToShoot = [deactivateLoader(action.type), setRefreshing({payload: false})] as Action[];
            if (res.metrics[0].iterations && res.metrics[0].iterations.length > 0) {
              actionsToShoot.push(new debugActions.SetDebugImages({res, task: action.payload.task}));
              switch (action.type) {
                case debugActions.GET_NEXT_DEBUG_IMAGES_BATCH:
                  actionsToShoot.push(new debugActions.SetTimeIsNow({task: action.payload.task, timeIsNow: false}));
                  break;
                case debugActions.SET_DEBUG_IMAGES_SELECTED_METRIC:
                  actionsToShoot.push(new debugActions.SetTimeIsNow({task: action.payload.task, timeIsNow: true}));
                  break;
                case debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH:
                  actionsToShoot.push(new debugActions.SetBeginningOfTime({
                    task: action.payload.task,
                    beginningOfTime: false
                  }));
                  break;
              }
            } else {
              switch (action.type) {
                case debugActions.GET_NEXT_DEBUG_IMAGES_BATCH:
                  actionsToShoot.push(new debugActions.SetBeginningOfTime({
                    task: action.payload.task,
                    beginningOfTime: true
                  }));
                  break;
                case debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH:
                  actionsToShoot.push(new debugActions.SetTimeIsNow({task: action.payload.task, timeIsNow: true}));
                  break;
              }
            }
            return actionsToShoot;
          }),
          catchError(error => [
            requestFailed(error),
            setRefreshing({payload: false}),
            deactivateLoader(action.type),
            deactivateLoader(refreshExperiments.type)
          ])
        )
    )
  );

  @Effect()
  fetchExperiments$ = this.actions$.pipe(
    ofType<debugActions.FetchExperiments>(debugActions.FETCH_EXPERIMENTS),
    switchMap((action) => this.apiTasks.tasksGetAllEx({id: action.payload, only_fields: ['id', 'name', 'status']})
      .pipe(
        mergeMap(res => [new debugActions.SetExperimentsNames(res), deactivateLoader(action.type)]),
        catchError(error => [requestFailed(error), deactivateLoader(action.type)])
      )
    )
  );


  @Effect()
  fetchMetrics$ = this.actions$.pipe(
    ofType<debugActions.GetDebugImagesMetrics | debugActions.RefreshDebugImagesMetrics>(debugActions.GET_DEBUG_IMAGES_METRICS, debugActions.REFRESH_DEBUG_IMAGES_METRICS),
    switchMap((action) => this.eventsApi.eventsGetTaskMetrics({
      tasks: action.payload.tasks,
      event_type: 'training_debug_image'
    })
      .pipe(
        mergeMap(res => [new debugActions.SetMetrics(res), deactivateLoader(action.type)]),
        catchError(error => [requestFailed(error), deactivateLoader(action.type)])
      )
    )
  );

  @Effect()
  fetchDebugImagesForIter$ = this.actions$.pipe(
    ofType(debugActions.getDebugImageSample),
    withLatestFrom(this.store.select(selectImageViewerScrollId)),
    switchMap(([action, scrollId]) =>
      this.eventsApi.eventsGetDebugImageSample({
        task: action.task,
        iteration: action.iteration,
        metric: action.metric,
        variant: action.variant,
        scroll_id: scrollId
      })
        .pipe(
          mergeMap(res => [
            setDebugImageIterations({min_iteration: res.min_iteration, max_iteration: res.max_iteration}),
            setCurrentDebugImage({event: res.event}), deactivateLoader(action.type),
            setDebugImageViewerScrollId({scrollId: res.scroll_id}),
          ]),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  );

  @Effect()
  getNextDebugImagesForIter$ = this.actions$.pipe(
    ofType(debugActions.getNextDebugImageSample),
    withLatestFrom(this.store.select(selectImageViewerScrollId)),
    switchMap(([action, scrollId]) =>
      this.eventsApi.eventsNextDebugImageSample({
        task: action.task,
        scroll_id: scrollId,
        navigate_earlier: action.navigateEarlier
      })
        .pipe(
          mergeMap(res => {
            if (!res.event) {
              return [action.navigateEarlier ? setDisplayerBeginningOfTime({beginningOfTime: true}) : setDisplayerEndOfTime({endOfTime: true})];
            } else {
              return [
                setDebugImageIterations({min_iteration: res.min_iteration, max_iteration: res.max_iteration}),
                setCurrentDebugImage({event: res.event}), deactivateLoader(action.type),
                setDebugImageViewerScrollId({scrollId: res.scroll_id}),
                action.navigateEarlier ? setDisplayerBeginningOfTime({beginningOfTime: false}) : setDisplayerEndOfTime({endOfTime: false})
              ];
            }
          }),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  );


  constructor(
    private actions$: Actions, private apiTasks: ApiTasksService,
    private eventsApi: ApiEventsService, private store: Store<any>
  ) {
  }

}
