import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {ModelInfoState} from '../reducers/model-info.reducer';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {catchError, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import * as infoActions from '../actions/models-info.actions';
import {updateModelDetails} from '../actions/models-info.actions';
import * as viewActions from '../actions/models-view.actions';
import * as menuActions from '../actions/models-menu.actions';
import {addTag, removeTag} from '../actions/models-menu.actions';
import {activeLoader, addMessage, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import {Router} from '@angular/router';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {of} from 'rxjs';
import {selectSelectedModel, selectSelectedModels, selectSelectedTableModel, selectTableMode} from '../reducers';
import {SelectedModel} from '../shared/models.model';
import {RouterState, selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {ModelsArchiveManyResponse} from '~/business-logic/model/models/modelsArchiveManyResponse';
import {EmptyAction} from '~/app.constants';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ModelsUnarchiveManyResponse} from '~/business-logic/model/models/modelsUnarchiveManyResponse';
import {getNotificationAction, MenuItems, MoreMenuItems} from '../../shared/entity-page/items.utils';
import {MESSAGES_SEVERITY} from '@common/constants';

@Injectable()
export class ModelsMenuEffects {

  constructor(
    private actions$: Actions,
    private store: Store<ModelInfoState>,
    private apiModels: ApiModelsService,
    private apiTasks: ApiTasksService,
    private router: Router) {
  }

  activeLoader = createEffect( () => this.actions$.pipe(
    ofType(menuActions.archiveSelectedModels, menuActions.publishModelClicked,
      menuActions.restoreSelectedModels, menuActions.changeProjectRequested),
    map(action => activeLoader(action.type))));


  publishModel$ = createEffect( () => this.actions$.pipe(
    ofType(menuActions.publishModelClicked),
    withLatestFrom(this.store.select(selectSelectedModel)),
    switchMap(([action, selectedModel]) => {
      const ids = action.selectedEntities.map(model => model.id);
      return this.apiModels.modelsPublishMany({ids})
          .pipe(
            mergeMap(res => this.updateModelsSuccess(action, MenuItems.publish, ids, selectedModel, res, {ready: true})),
            catchError(error => this.publishModelFailedText(error, action.selectedEntities).pipe(
              mergeMap(errorMessage => [
                requestFailed(error),
                deactivateLoader(action.type),
                setServerError(error, null, errorMessage)
              ])
              )
            )
          );
      }
    )
  ));


  changeProject$ = createEffect( () => this.actions$.pipe(
    ofType(menuActions.changeProjectRequested),
    withLatestFrom(this.store.select(selectSelectedModel)),
    switchMap(
      ([action, selectedInfoModel]) => {
        const selectedModel = action.selectedModels.find(model => model.id === selectedInfoModel?.id);
        return this.apiModels.modelsMove({
          ids: action.selectedModels.map(model => model.id),
          project: action.project.id,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          project_name: action.project.name})
          .pipe(
            tap((res) => this.router.navigate([`projects/${action.project.id? action.project.id : res.project_id ?? '*'}/models/${action.selectedModels.length === 1 ? action.selectedModels[0].id : ''}`], {queryParamsHandling: 'merge'})),
            mergeMap(() => [
              viewActions.resetState(),
              selectedModel ? infoActions.setModelInfo({model: selectedModel}) : new EmptyAction(),
              deactivateLoader(action.type),
              addMessage(MESSAGES_SEVERITY.SUCCESS, `Model moved successfully to ${action.project.name ?? 'Projects root'}`)
            ]),
            catchError(error => [requestFailed(error), deactivateLoader(action.type), setServerError(error, null, 'Failed to Move model')])
          );
      }
    )
  ));

  publishModelFailedText(error: any, model) {
    if (model.task && error?.error?.meta?.result_subcode == 110) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      return this.apiTasks.tasksGetAllEx({id: [model.task.id], only_fields: ['id', 'name', 'project']}).pipe(
        map((tasks) => {
          const task = tasks.tasks[0];
          const projectId = task.project ? task.project.id : '*';
          const taskLink = `<a target="_blank" href="projects/${projectId}/experiments/${task.id}">${task.name}</a>`;
          return `Your attempt to publish this model failed.  The task that created this model may be in progress.<br>When the task ${taskLink} completes or is stopped by a user, you can try again.`;
        })
      );
    } else {
      const errorText = 'Your attempt to publish models failed.';
      return of(errorText);
    }
  }

  addTag$ = createEffect( () => this.actions$.pipe(
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
  ));

  removeTag$ = createEffect( () => this.actions$.pipe(
    ofType(removeTag),
    switchMap((action) =>
      action.models.map(model => {
        if (model.tags.includes(action.tag)) {
          return updateModelDetails({
            id: model.id,
            changes: {tags: model.tags.filter(tag => tag !== action.tag)}
          });
        } else {
          return null;
        }
      }).filter(update => update !== null)
        .concat(addMessage('success', `“${action.tag}” tag has been removed from “${action.models[0]?.name}” model`, [
            {
              name: 'Undo',
              actions: [
                addMessage('success', `“${action.tag}” tag has been restored`),
                ...action.models.map(() => addTag({
                    models: action.models,
                    tag: action.tag
                  })
                )
              ]
            }
          ]
        ) as any)
    )
  ));

  archiveModels = createEffect(() => this.actions$.pipe(
    ofType(menuActions.archiveSelectedModels),
    withLatestFrom(
      this.store.select(selectSelectedTableModel)
    ),
    switchMap(([action, selectedTableModel]) =>
      this.apiModels.modelsArchiveMany({ids: action.selectedEntities.map((model) => model.id)})
        .pipe(
          withLatestFrom(this.store.select(selectRouterConfig)),
          mergeMap(([res, routerConfig]: [ModelsArchiveManyResponse, RouterState['config']]) => {
            const models = action.selectedEntities;
            const allFailed = res.failed.length === models.length;
            const undoAction = [
              {
                name: 'Undo', actions: [
                  viewActions.setSelectedModels({models}),
                  menuActions.restoreSelectedModels({selectedEntities: models, skipUndo: true})
                ]
              }
            ];
            let actions: Action[] = [
              deactivateLoader(action.type),
              viewActions.setSelectedModels({models: []}),
              getNotificationAction(res, action, MenuItems.archive, EntityTypeEnum.model, (action.skipUndo || allFailed) ? [] : undoAction)
            ];
            if (routerConfig.includes('models')) {
              const failedIds = res.failed.map(fail => fail.id);
              const successModels = models.map(model => model.id).filter(id => !failedIds.includes(id));
              actions = actions.concat([
                viewActions.removeModels({modelIds: successModels}),
                viewActions.fetchModelsRequested()
              ]);
            }
            if (this.isSelectedModelInCheckedModels(action.selectedEntities, selectedTableModel)) {
              actions.push(viewActions.selectNextModel());
            }
            return actions;
          }),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, 'Failed To Archive models')
          ])
        )
    )
  ));


  restoreModels = createEffect(() => this.actions$.pipe(
    ofType(menuActions.restoreSelectedModels),
    withLatestFrom(
      this.store.select(selectRouterParams),
      this.store.select(selectSelectedTableModel),
      this.store.select(selectTableMode)
    ),
    tap(([action, routerParams, selectedModel, tableMode]) => {
      if (this.isSelectedModelInCheckedModels(action.selectedEntities, selectedModel)) {
        this.router.navigate([`projects/${routerParams.projectId}/models/${tableMode === 'info' ? routerParams.modelId : ''}`]);
      }
    }),
    switchMap(([action]) => this.apiModels.modelsUnarchiveMany({ids: action.selectedEntities.map((model) => model.id)})
      .pipe(
        withLatestFrom(this.store.select(selectRouterConfig)),
        mergeMap(([res, routerConfig]: [ModelsUnarchiveManyResponse, RouterState['config']]) => {
          const models = action.selectedEntities;
          const allFailed = res.failed.length === models.length;
          const undoAction = [
            {
              name: 'Undo', actions: [
                viewActions.setSelectedModels({models}),
                menuActions.archiveSelectedModels({selectedEntities: models, skipUndo: true})
              ]
            }
          ];
          let actions: Action[] = [
            deactivateLoader(action.type),
            viewActions.setSelectedModels({models: []}),
            getNotificationAction(res, action, MoreMenuItems.restore, EntityTypeEnum.model, (action.skipUndo || allFailed) ? [] : undoAction)
          ];
          if (routerConfig.includes('models')) {
            const failedIds = res.failed.map(fail => fail.id);
            const successModels = models.map(model => model.id).filter(id => !failedIds.includes(id));
            actions = actions.concat([
              viewActions.removeModels({modelIds: successModels}),
              viewActions.fetchModelsRequested()
            ]);
          }
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Failed To Restore models')
        ])
      )
    )
  ));


  private updateModelsSuccess(action, operationName: MenuItems, ids: string[], selectedEntity, res: ModelsArchiveManyResponse, changes): Action[] {
    const actions = [
        ...ids.map(id => viewActions.updateModel({id, changes})),
      deactivateLoader(action.type)
      ] as Action[];
    if (ids.includes(selectedEntity?.id)) {
      actions.push(infoActions.setModelInfo({model: {...selectedEntity, ...changes}}));
    }
    actions.push(getNotificationAction(res, action, operationName, EntityTypeEnum.model));
    return actions;
  }



  isSelectedModelInCheckedModels(checkedModels, selectedModel) {
    return selectedModel && checkedModels.some(model => model.id === selectedModel.id);
  }
}
