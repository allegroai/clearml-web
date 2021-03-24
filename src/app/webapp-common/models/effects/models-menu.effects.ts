import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../reducers/model-info.reducer';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {catchError, flatMap, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import * as infoActions from '../actions/models-info.actions';
import * as viewActions from '../actions/models-view.actions';
import * as menuActions from '../actions/models-menu.actions';
import {ActiveLoader, AddMessage, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {RequestFailed} from '../../core/actions/http.actions';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlModelsService} from '../../../business-logic/services/models.service';
import {get} from 'lodash/fp';
import {Router} from '@angular/router';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {of} from 'rxjs';
import {addTag, removeTag} from '../actions/models-menu.actions';
import {updateModelDetails} from '../actions/models-info.actions';
import {selectSelectedModel, selectSelectedModels, selectSelectedTableModel} from '../reducers';
import {SelectedModel} from '../shared/models.model';

@Injectable()
export class ModelsMenuEffects {

  constructor(private actions$: Actions, private store: Store<ModelInfoState>, private apiModels: ApiModelsService, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private modelBl: BlModelsService, private router: Router) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(menuActions.ARCHIVE_CLICKED, menuActions.PUBLISH_MODEL_CLICKED,
      menuActions.RESTORE_CLICKED, menuActions.CHANGE_PROJECT_REQUESTED),
    map(action => new ActiveLoader(action.type)));


  @Effect()
  publishModel$ = this.actions$.pipe(
    ofType<menuActions.PublishModelClicked>(menuActions.PUBLISH_MODEL_CLICKED),
    withLatestFrom(this.store.select(selectSelectedModel)),
    switchMap(([action, selectedModel]) =>
      this.apiModels.modelsSetReady({model: action.payload.id})
        .pipe(
          flatMap(() => [
            new infoActions.SetModel({...selectedModel, ready: true}),
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
      action => this.apiModels.modelsMove({ids: [action.payload.model.id], project: action.payload.project.id, project_name: action.payload.project.name})
        .pipe(
          tap((res) => this.router.navigate([`projects/${action.payload.project.id? action.payload.project.id : res.project_id}/models/${action.payload.model.id}`], {queryParamsHandling: 'merge'})),
          flatMap(() => [
            new viewActions.ResetState(),
            new infoActions.SetModel(action.payload.model),
            new DeactiveLoader(action.type)
          ]),
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
    withLatestFrom(this.store.select(selectSelectedModels), this.store.select(selectSelectedTableModel)),
    switchMap(([action, selectedModels, selectedModelInfo]) => {
        const modelsFromState = selectedModelInfo ? selectedModels.concat(selectedModelInfo) as SelectedModel[] : selectedModels;
        return action.models.map(model => {
          const modelFromState = modelsFromState.find(mod => mod.id === model.id);
          return updateModelDetails({
            id: model.id,
            changes: {tags: Array.from(new Set((modelFromState?.tags || model.tags || []).concat([action.tag]))).sort() as string[]}
          });
        });
      }
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
        .concat(new AddMessage('success', `“${action.tag}” tag has been removed from “${action.models[0]?.name}” model`, [
            {
              name: 'Undo',
              actions: [
                new AddMessage('success', `“${action.tag}” tag has been restored`),
                ...action.models.map(experiment => addTag({
                    models: action.models,
                    tag: action.tag
                  })
                )
              ]
            }
          ]
        ) as any)
    )
  );
}
