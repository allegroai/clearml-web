import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {deactivateLoader} from '@common/core/actions/layout.actions';
import {requestFailed} from '@common/core/actions/http.actions';
import {
  getDebugImageSample, getNextDebugImageSample, setCurrentDebugImage, setDebugImageIterations, setDebugImageViewerScrollId, setViewerBeginningOfTime, setViewerEndOfTime
} from '@common/shared/debug-sample/debug-sample.actions';
import {selectImageViewerScrollId} from '@common/shared/debug-sample/debug-sample.reducer';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {Store} from '@ngrx/store';


@Injectable()
export class DebugSampleEffects {


  constructor(private actions$: Actions, private eventsApi: ApiEventsService, private store: Store<any>) {
  }

  fetchDebugImagesForIter$ = createEffect(() => this.actions$.pipe(
    ofType(getDebugImageSample),
    withLatestFrom(this.store.select(selectImageViewerScrollId)),
    switchMap(([action, scrollId]) =>
      this.eventsApi.eventsGetDebugImageSample({
        /* eslint-disable @typescript-eslint/naming-convention */
        task: action.task,
        iteration: action.iteration,
        metric: action.metric,
        variant: action.variant,
        scroll_id: scrollId,
        navigate_current_metric: !action.isAllMetrics
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap(res => [
            // eslint-disable-next-line @typescript-eslint/naming-convention
            setDebugImageIterations({min_iteration: res.min_iteration, max_iteration: res.max_iteration}),
            setCurrentDebugImage({event: res.event}), deactivateLoader(action.type),
            setDebugImageViewerScrollId({scrollId: res.scroll_id}),
          ]),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  ));

  getNextDebugImagesForIter$ = createEffect(() => this.actions$.pipe(
    ofType(getNextDebugImageSample),
    withLatestFrom(this.store.select(selectImageViewerScrollId)),
    switchMap(([action, scrollId]) =>
      this.eventsApi.eventsNextDebugImageSample({
        /* eslint-disable @typescript-eslint/naming-convention */
        task: action.task,
        scroll_id: scrollId,
        navigate_earlier: action.navigateEarlier,
        ...(action.iteration && {next_iteration: true})
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap(res => {
            if (!res.event) {
              return [action.navigateEarlier ? setViewerBeginningOfTime({beginningOfTime: true}) : setViewerEndOfTime({endOfTime: true})];
            } else {
              return [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                setDebugImageIterations({min_iteration: res.min_iteration, max_iteration: res.max_iteration}),
                setCurrentDebugImage({event: res.event}), deactivateLoader(action.type),
                setDebugImageViewerScrollId({scrollId: res.scroll_id}),
                !action.navigateEarlier ? setViewerBeginningOfTime({beginningOfTime: false}) : setViewerEndOfTime({endOfTime: false})
              ];
            }
          }),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  ));

}
