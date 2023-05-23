import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {
  catchError,
  debounceTime,
  expand,
  filter,
  map,
  mergeMap, reduce,
  shareReplay,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {ModelsGetAllResponse} from '~/business-logic/model/models/modelsGetAllResponse';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, deactivateLoader, setBackdrop, setServerError} from '../../core/actions/layout.actions';
import {selectAppVisible} from '../../core/reducers/view.reducer';
import * as infoActions from '../actions/models-info.actions';
import {resetActiveSection} from '../actions/models-info.actions';
import * as viewActions from '../actions/models-view.actions';
import {ModelInfoState} from '../reducers/model-info.reducer';
import {MODELS_INFO_ONLY_FIELDS} from '../shared/models.const';
import {selectSelectedModel} from '../reducers';
import {SelectedModel} from '../shared/models.model';
import {selectActiveWorkspace} from '../../core/reducers/users-reducer';
import {isExample} from '../../shared/utils/shared-utils';
import {isSharedAndNotOwner} from '@common/shared/utils/is-shared-and-not-owner';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {EMPTY} from 'rxjs';

@Injectable()
export class ModelsInfoEffects {

  constructor(
    private actions$: Actions,
    private store: Store<ModelInfoState>,
    private apiModels: ApiModelsService,
    private eventsService: ApiEventsService
  ) {}

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(infoActions.getModelInfo),
    map(action => activeLoader(action.type))));


  getModelInfo$ = createEffect(() => this.actions$.pipe(
    ofType(infoActions.getModelInfo, infoActions.refreshModelInfo),
    withLatestFrom(this.store.select(selectActiveWorkspace), this.store.select(selectAppVisible)),
    filter(([, , visible]) => visible),
    switchMap(([action, activeWorkspace]) =>
      // eslint-disable-next-line @typescript-eslint/naming-convention
      this.apiModels.modelsGetByIdEx({id: [action.id], only_fields: MODELS_INFO_ONLY_FIELDS})
        .pipe(
          mergeMap((res: ModelsGetAllResponse) => {
            const model = res.models[0] as SelectedModel;
            const actions = [deactivateLoader(action.type)] as Action[];
            if (model) {
              model.readOnly = isExample(model) || isSharedAndNotOwner(model, activeWorkspace);
              actions.push(infoActions.setModelInfo({model}));
            }
            return actions;
          }),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, 'Fetch Model failed')
          ])
        )
    )
  ));

  editModel$ = createEffect(() => this.actions$.pipe(
    ofType(infoActions.editModel),
    debounceTime(1000),
    switchMap((action) => {
      const parent = action.model.parent ? (action.model.parent as any).id : undefined;
      return this.apiModels.modelsEdit({
        model: action.model.id, ...action.model,
        project: action.model.project?.id,
        task: action.model.task?.id,
        parent
      })
        .pipe(
          mergeMap(() => [
            infoActions.getModelInfo({id: action.model.id}),
            infoActions.setSavingModel (false),
            setBackdrop({active: false})
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err, null, 'edit models failed'),
            setBackdrop({active: false}),
            infoActions.getModelInfo({id: action.model.id}),
          ])
        );
    }),
    shareReplay(1)
  ));

  saveModelMetadata$ = createEffect(() => this.actions$.pipe(
    ofType(infoActions.saveMetaData),
    withLatestFrom(this.store.select(selectSelectedModel)),
    mergeMap(([action, selectedModel]) =>
      this.apiModels.modelsEdit({model: selectedModel.id, metadata: action.metadata})
        .pipe(
          mergeMap(() => [
              infoActions.getModelInfo({id: selectedModel.id}),
              infoActions.setSavingModel (false),
              resetActiveSection(),
              setBackdrop({active: false})
            ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err, null, 'Update metadata failed'),
          ])
        )
    ),
    shareReplay(1)
  ));


  updateModelDetails$ = createEffect(() => this.actions$.pipe(
    ofType(infoActions.updateModelDetails),
    withLatestFrom(this.store.select(selectSelectedModel)),
    mergeMap(([action, selectedModel]) =>
      this.apiModels.modelsUpdate({model: action.id, ...action.changes})
        .pipe(
          mergeMap((res) => {
            const changes = res?.fields || action.changes;
            return [
              viewActions.updateModel({id: action.id, changes}),
              ...(selectedModel?.id === action.id ?
                [infoActions.modelDetailsUpdated({id: action.id, changes})]
                : []
              ),
              ...(changes.tags ? [viewActions.getTags()] : [])
            ];
          }),
          catchError(err => [
            requestFailed(err),
            setServerError(err, null, 'Update models failed'),
            infoActions.getModelInfo({id: action.id}),
          ])
        )
    ),
    shareReplay(1)
  ));

  fetchExperimentPlots$ = createEffect(() => this.actions$.pipe(
    ofType(infoActions.getPlots),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap(action => this.eventsService.eventsGetTaskPlots({task: action.id, model_events: true}).pipe(
      map(res => [res.plots.length, res]),
      expand(([plotsLength, data]) => plotsLength < data.total
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ? this.eventsService.eventsGetTaskPlots({task: action.id, iters: 1, scroll_id: data.scroll_id})
          .pipe(map(res => [plotsLength + res.plots.length, res]))
        : EMPTY
      ),
      reduce((acc, [, data]) => acc.concat(data.plots), [])
    )),
    mergeMap((allPlots: any) => [
      infoActions.setPlots({plots: allPlots})
    ]),
    catchError(error => [
      requestFailed(error),
      deactivateLoader(infoActions.getPlots.type),
      deactivateLoader(infoActions.refreshModelInfo.type),
      setServerError(error, null, 'Failed to get Plot Charts')
    ])
  ));

  // fetchScalars$ = createEffect(() => this.actions$.pipe(
  //   ofType(infoActions.getScalars),
  //   withLatestFrom(
  //     this.store.select(selectSelectedSettingsxAxisType),
  //     this.store.select(selectExperimentHistogramCacheAxisType)
  //   ),
  //   switchMap(([action, axisType, prevAxisType]) => {
  //       if ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(prevAxisType) &&
  //         [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(axisType)) {
  //         return [
  //           deactivateLoader(infoActions.refreshModelInfo.type),
  //           deactivateLoader(action.type)
  //         ];
  //       }
  //
  //       return this.eventsService.eventsScalarMetricsIterHistogram({
  //         task: action.id,
  //         // eslint-disable-next-line @typescript-eslint/naming-convention
  //         model_events: true,
  //         key: axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType
  //       })
  //         .pipe(
  //           mergeMap(res => [
  //             infoActions.setScalars({scalars: res, axisType}),
  //             deactivateLoader(infoActions.refreshModelInfo.type),
  //             deactivateLoader(action.type)
  //           ]),
  //           catchError(error => [
  //             requestFailed(error),
  //             deactivateLoader(action.type),
  //             deactivateLoader(infoActions.refreshModelInfo.type),
  //             setServerError(error, null, 'Failed to get Scalar Charts')
  //           ])
  //         );
  //     })
  // ));
}
