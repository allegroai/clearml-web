import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {catchError, debounceTime, filter, flatMap, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {ModelsGetAllResponse} from '../../../business-logic/model/models/modelsGetAllResponse';
import {RequestFailed} from '../../core/actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetBackdrop, SetServerError} from '../../core/actions/layout.actions';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import * as infoActions from '../actions/models-info.actions';
import * as viewActions from '../actions/models-view.actions';
import {IModelInfoState} from '../reducers/model-info.reducer';
import {MODELS_INFO_ONLY_FIELDS} from '../shared/models.const';

@Injectable()
export class ModelsInfoEffects {

  constructor(private actions$: Actions, private store: Store<IModelInfoState>,
    private apiModels: ApiModelsService) {}

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(infoActions.GET_MODEL_INFO),
    map(action => new ActiveLoader(action.type)));


  @Effect()
  getModelInfo$ = this.actions$.pipe(
    ofType<infoActions.GetModelInfo>(infoActions.GET_MODEL_INFO, infoActions.REFRESH_MODEL_INFO),
    withLatestFrom(
      this.store.select(selectAppVisible)),
    filter(([action, visible]) => visible),
    switchMap(([action])=>
      this.apiModels.modelsGetAllEx({id: [action.payload], only_fields: MODELS_INFO_ONLY_FIELDS})
        .pipe(
          flatMap((res: ModelsGetAllResponse) => [
            new infoActions.SetModel(res.models[0]),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Fetch Model failed')
          ])
        )
    )
  );
  @Effect()
  editModel$ = this.actions$.pipe(
      ofType<infoActions.EditModel>(infoActions.EDIT_MODEL),
    debounceTime(1000),
    switchMap((action) =>{
      const parent =  action.payload.parent ? (action.payload.parent as any).id : undefined;
      return this.apiModels.modelsEdit({model: action.payload.id, ...action.payload, project: action.payload.project.id, task: action.payload.task.id, parent: parent})
        .pipe(
          flatMap((res) => [
            new infoActions.GetModelInfo(action.payload.id),
            new infoActions.SetIsModelSaving(false),
            new SetBackdrop(false)
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err, null, 'edit models failed'),
            new SetBackdrop(false),
            new infoActions.GetModelInfo(action.payload.id)
          ])
        )}
    ),
    shareReplay(1)
  );

  @Effect()
  updateModelDetails$ = this.actions$.pipe(
    ofType(infoActions.updateModelDetails),
    flatMap((action) =>
      this.apiModels.modelsUpdate({model: action.id, ...action.changes})
        .pipe(
          flatMap((res) => {
            const changes = res?.fields || action.changes;
            return [
              new viewActions.UpdateModel({id: action.id, changes}),
              new infoActions.ModelDetailsUpdated({id: action.id, changes})
            ];
          }),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err, null, 'Update models failed'),
            new infoActions.GetModelInfo(action.id)
          ])
        )
    ),
    shareReplay(1)
  );

}
