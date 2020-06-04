import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IModelInfoState} from '../reducers/model-info.reducer';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {catchError, flatMap, map, switchMap, tap} from 'rxjs/operators';
import * as infoActions from '../actions/models-info.actions';
import * as viewActions from '../actions/models-view.actions';
import * as menuActions from '../actions/models-menu.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {RequestFailed} from '../../core/actions/http.actions';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlModelsService} from '../../../business-logic/services/models.service';
import {get} from 'lodash/fp';
import {Router} from '@angular/router';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {of} from 'rxjs';
import {setArchive} from '../../core/actions/projects.actions';
import {addTag, removeTag} from '../actions/models-menu.actions';
import {ModelDetailsUpdated, updateModelDetails} from '../actions/models-info.actions';

@Injectable()
export class ModelsMenuEffects {

  constructor(private actions$: Actions, private store: Store<IModelInfoState>, private apiModels: ApiModelsService, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private modelBl: BlModelsService, private router: Router) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(menuActions.ARCHIVE_CLICKED, menuActions.PUBLISH_MODEL_CLICKED,
      menuActions.RESTORE_CLICKED, menuActions.CHANGE_PROJECT_REQUESTED),
    map(action => new ActiveLoader(action.type)));

  @Effect()
  archiveModel$ = this.actions$.pipe(
    ofType<menuActions.ArchiveClicked>(menuActions.ARCHIVE_CLICKED),
    // (nir) not working anyway
    // tap((action) => {
    //   if (action.payload.selectedModel && action.payload.selectedModel.id === action.payload.model.id) {
    //     this.router.navigate([`projects/${action.payload.projectId}/models/`]);
    //   }
    // }),
    map(action => [action, this.modelBl.addHiddenTag(action.payload.model.system_tags)]),
    switchMap(([action, system_tags]: [menuActions.ArchiveClicked, Array<string>]) =>
      this.apiModels.modelsUpdate({model: action.payload.model.id, system_tags: system_tags})
        .pipe(
          flatMap(() => [
            new infoActions.SetModel({...action.payload.model, system_tags: system_tags}),
            new viewActions.UpdateModel({id: action.payload.model.id, changes: {system_tags}}),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Update Model failed')
          ])
        )
    )
  );

  @Effect()
  restoreModel$ = this.actions$.pipe(
    ofType<menuActions.RestoreClicked>(menuActions.RESTORE_CLICKED),
    // tap((action) => {
    //   let path = `projects/${action.payload.projectId}/models/`;
    //   if (action.payload.selectedModel && action.payload.selectedModel.id !== action.payload.model.id) {
    //     path += action.payload.model.id;
    //   }
    //   this.store.dispatch(setArchive({archive: true}));
    //   this.router.navigate([path]);
    // }),
    map(action => [action, this.modelBl.removeHiddenTag(action.payload.model.system_tags)]),
    switchMap(([action, system_tags]: [menuActions.RestoreClicked, Array<string>]) =>
      this.apiModels.modelsUpdate({model: action.payload.model.id, system_tags: system_tags})
        .pipe(
          flatMap(() => [
            new infoActions.SetModel({...action.payload.model, system_tags: system_tags}),
            new viewActions.UpdateModel({id: action.payload.model.id, changes: {system_tags}}),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Update Model failed')
          ])
        )
    )
  );

  @Effect()
  publishModel$ = this.actions$.pipe(
    ofType<menuActions.PublishModelClicked>(menuActions.PUBLISH_MODEL_CLICKED),
    switchMap((action: menuActions.PublishModelClicked) =>
      this.apiModels.modelsSetReady({model: action.payload.id})
        .pipe(
          flatMap(() => [
            new infoActions.SetModel({...action.payload, ready: true}),
            new viewActions.UpdateModel({id: action.payload.id, changes: {ready: true}}),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => this.publishModelFailedText(error, action.payload).pipe(
            flatMap(errorMessage => [
              new RequestFailed(error),
              new DeactiveLoader(action.type),
              new SetServerError(error, null, errorMessage)
            ])
            )
          )
        )
    )
  );

  @Effect()
  changeProject$ = this.actions$.pipe(
    ofType<menuActions.ChangeProjectRequested>(menuActions.CHANGE_PROJECT_REQUESTED),
    switchMap(
      action => this.apiModels.modelsUpdate({model: action.payload.model.id, project: action.payload.project.id})
        .pipe(
          flatMap(() => [
            new viewActions.ResetState(),
            new infoActions.SetModel({...action.payload.model, project: action.payload.project}),
            new DeactiveLoader(action.type)
          ]),
          tap(() => this.router.navigate([`projects/${action.payload.project.id}/models/${action.payload.model.id}`], {queryParamsHandling: 'merge'})),
          catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type)])
        )
    )
  );

  publishModelFailedText(error: any, model) {
    if (model.task && get('error.meta.result_subcode', error) == 110) {
      return this.apiTasks.tasksGetAllEx({id: [model.task.id], only_fields: ['id', 'name', 'project']}).pipe(
        map((tasks) => {
          const task = tasks.tasks[0];
          const projectId = task.project ? task.project.id : '*';
          const taskLink = `<a target="_blank" href="projects/${projectId}/experiments/${task.id}">${task.name}</a>`;
          return `Your attempt to publish this model failed.  The task that created this model may be in progress.<br>When the task ${taskLink} completes or is stopped by a user, you can try again.`;
        })
      );
    } else {
      const errorText = 'Your attempt to publish this models failed.';
      return of(errorText);
    }
  }

  @Effect()
  addTag$ = this.actions$.pipe(
    ofType(addTag),
    switchMap((action) =>
      action.models.map(model =>
        updateModelDetails({
          id: model.id,
          changes: {tags: (model.tags || []).concat([action.tag])}
        }))
    )
  );

  @Effect()
  removeTag$ = this.actions$.pipe(
    ofType(removeTag),
    switchMap((action) =>
      action.models.map(model => {
        if (model.tags.includes(action.tag)) {
          return updateModelDetails({
            id: model.id,
            changes: {tags: model.tags.filter(tag => tag !== action.tag)}
          });
        } else {
          return false;
        }
      }).filter(update => update !== false)
    )
  );
}
