import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, flatMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import * as  debugActions from './debug-images-actions';
import {ActiveLoader, DeactiveLoader} from '../core/actions/layout.actions';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiEventsService} from '../../business-logic/api-services/events.service';
import {RequestFailed} from '../core/actions/http.actions';
import {REFRESH_EXPERIMENTS} from '../experiments/actions/common-experiments-view.actions';
import {setRefreshing} from '../experiments-compare/actions/compare-header.actions';
import {Store} from '@ngrx/store';
import {selectDebugImages} from './debug-images-reducer';

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
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  fetchDebugImages$ = this.actions$.pipe(
    ofType<debugActions.SelectMetric | debugActions.GetNextBatch | debugActions.GetPreviousBatch | debugActions.RefreshMetric>
    (debugActions.SET_DEBUG_IMAGES_SELECTED_METRIC, debugActions.GET_NEXT_DEBUG_IMAGES_BATCH, debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH, debugActions.REFRESH_IMAGES_SELECTED_METRIC),
    withLatestFrom(this.store.select(selectDebugImages)),
    flatMap(([action, debugImages]) =>
      this.eventsApi.eventsDebugImages({
        metrics: [action.payload],
        iters: 3,
        scroll_id: debugImages[action.payload.task] ? debugImages[action.payload.task].scroll_id : null,
        navigate_earlier: action.type !== debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH,
        refresh: [debugActions.SET_DEBUG_IMAGES_SELECTED_METRIC, debugActions.REFRESH_IMAGES_SELECTED_METRIC].includes(action.type)
      })
        .pipe(
          flatMap((res: any) => {
            const actionsToShoot = [new DeactiveLoader(action.type), setRefreshing({payload: false})];
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
                  actionsToShoot.push(new debugActions.SetBeginningOfTime({task: action.payload.task, beginningOfTime: false}));
                  break;
              }
            } else {
              switch (action.type) {
                case debugActions.GET_NEXT_DEBUG_IMAGES_BATCH:
                  actionsToShoot.push(new debugActions.SetBeginningOfTime({task: action.payload.task, beginningOfTime: true}));
                  break;
                case debugActions.GET_PREVIOUS_DEBUG_IMAGES_BATCH:
                  actionsToShoot.push(new debugActions.SetTimeIsNow({task: action.payload.task, timeIsNow: true}));
                  break;
              }
            }
            return actionsToShoot;
          }),
          catchError(error => [
            new RequestFailed(error),
            setRefreshing({payload: false}),
            new DeactiveLoader(action.type),
            new DeactiveLoader(REFRESH_EXPERIMENTS)
          ])
        )
    )
  );

  @Effect()
  fetchExperiments$ = this.actions$.pipe(
    ofType<debugActions.FetchExperiments>(debugActions.FETCH_EXPERIMENTS),
    switchMap((action) => this.apiTasks.tasksGetAllEx({id: action.payload, only_fields: ['id', 'name', 'status']})
      .pipe(
        flatMap(res => [new debugActions.SetExperimentsNames(res), new DeactiveLoader(action.type)]),
        catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type)])
      )
    )
  );


  @Effect()
  fetchMetrics$ = this.actions$.pipe(
    ofType<debugActions.GetDebugImagesMetrics | debugActions.RefreshDebugImagesMetrics>(debugActions.GET_DEBUG_IMAGES_METRICS, debugActions.REFRESH_DEBUG_IMAGES_METRICS),
    switchMap((action) => this.eventsApi.eventsGetTaskMetrics({tasks: action.payload.tasks, event_type: 'training_debug_image'})
      .pipe(
        flatMap(res => [new debugActions.SetMetrics(res), new DeactiveLoader(action.type)]),
        catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type)])
      )
    )
  );

  constructor(
    private actions$: Actions, private apiTasks: ApiTasksService,
    private eventsApi: ApiEventsService, private store: Store<any>
  ) {
  }

}
