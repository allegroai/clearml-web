import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {catchError, filter, flatMap, map, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {EXPERIMENT_INFO_ONLY_FIELDS} from '../../../features/experiments/experiments.consts';
import {selectExperimentFormValidity, selectExperimentInfoData, selectExperimentInfoDataFreeze, selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {ExperimentReverterService} from '../../../features/experiments/shared/services/experiment-reverter.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetBackdrop, SetServerError} from '../../core/actions/layout.actions';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import * as commonInfoActions from '../actions/common-experiments-info.actions';
import {deleteHyperParamsSection, getExperimentConfigurationNames, getExperimentConfigurationObj, saveExperimentConfigObj, saveHyperParamsSection} from '../actions/common-experiments-info.actions';
import * as infoActions from '../../../features/experiments/actions/experiments-info.actions';
import {UpdateExperiment} from '../actions/common-experiments-view.actions';
import {selectExperimentConfiguration, selectExperimentHyperParamsSelectedSectionFromRoute, selectExperimentSelectedConfigObjectFromRoute, selectExperimentsList, selectSelectedExperimentFromRouter, selectSelectedTableExperiment} from '../reducers';
import {convertStopToComplete} from '../shared/common-experiments.utils';
import {ExperimentConverterService} from '../../../features/experiments/shared/services/experiment-converter.service';
import {of} from 'rxjs';
import {EmptyAction} from '../../../app.constants';
import {ReplaceHyperparamsEnum} from '../../../business-logic/model/tasks/replaceHyperparamsEnum';
import {Router} from '@angular/router';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {cloneDeep, get} from 'lodash/fp';


@Injectable()
export class CommonExperimentsInfoEffects {
  private previousSelectedLastUpdate: Date = null;
  private previousSelectedId: string;


  constructor(
    private actions$: Actions, private store: Store<IExperimentInfoState>,
    private apiTasks: ApiTasksService, private reverter: ExperimentReverterService,
    private converter: ExperimentConverterService,
    private router: Router
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(commonInfoActions.GET_EXPERIMENT_INFO),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getExperimentConfigurationNames$ = this.actions$.pipe(
    ofType(getExperimentConfigurationNames),
    withLatestFrom(
      this.store.select(selectSelectedExperimentFromRouter),
      this.store.select(selectExperimentConfiguration),
      this.store.select(selectExperimentSelectedConfigObjectFromRoute)
    ),
    filter(([action, experimentId, configuration, selectedConfiguration]) => !!experimentId),
    switchMap(([action, experimentId, configuration, selectedConfiguration]) => this.apiTasks.tasksGetConfigurationNames({tasks: [experimentId]})
      .pipe(
        flatMap(res => {
          let configurations = cloneDeep(configuration);
          if (configurations) {
            Object.keys(configurations).forEach(name => {
              if (!res.configurations[0]?.names.includes(name)) {
                delete configurations.name;
              }
            });
          } else {
            configurations = {};
          }
          res.configurations[0]?.names.forEach(name => {
            if (!(name in configurations)) {
              configurations[name] = {};
            }
          });
          return [
            new commonInfoActions.UpdateExperimentInfoData({id: experimentId, changes: {configuration: configurations}}),
            selectedConfiguration? getExperimentConfigurationObj(): new EmptyAction(),
            new DeactiveLoader(action.type),
          ];
        }),
        catchError(error => {
          console.log(error);
          return [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Fetch configuration names failed',
              action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
          ];
        })
      )
    )
  );

  @Effect()
  getExperimentConfigurationObj$ = this.actions$.pipe(
    ofType(getExperimentConfigurationObj),
    withLatestFrom(
      this.store.select(selectSelectedExperimentFromRouter),
      this.store.select(selectExperimentConfiguration),
      this.store.select(selectExperimentSelectedConfigObjectFromRoute)
    ),
    filter(([action, experimentId, configuration, configObj]) => configuration && configObj && (configObj in configuration)),
    switchMap(([action, experimentId, configuration, configObj]) => this.apiTasks.tasksGetConfigurations({tasks: [experimentId], names: [configObj]})
      .pipe(
        flatMap((res: any) => {
          const configurationObj = cloneDeep(configuration);
          configurationObj[configObj] = res.configurations[0].configuration[0];
          return [
            new commonInfoActions.UpdateExperimentInfoData({id: experimentId, changes: {configuration: configurationObj}}),
            new DeactiveLoader(action.type),
          ];
        }),
        catchError(error => {
          console.log(error);
          return [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Fetch configuration failed',
              action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
          ];
        })
      )
    )
  );

  @Effect()
  getExperimentInfo$ = this.actions$.pipe(
    ofType<commonInfoActions.GetExperimentInfo>(commonInfoActions.GET_EXPERIMENT_INFO, commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO, commonInfoActions.EXPERIMENT_UPDATED_SUCCESSFULLY),
    withLatestFrom(
      this.store.select(selectSelectedTableExperiment),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentsList),
      this.store.select(selectExperimentInfoData),
      this.store.select(selectAppVisible),
    ),
    switchMap(([action, tableSelected, selected, experiments, infoData, visible]) => {
      const currentSelected = tableSelected || selected;
      if (this.previousSelectedId && currentSelected?.id != this.previousSelectedId) {
        this.previousSelectedLastUpdate = null;
      }
      this.previousSelectedId = currentSelected?.id;

      if (!infoData || !currentSelected || !visible) {
        return of([action, null, tableSelected, selected]);
      }

      const listed = experiments.find(e => e.id === currentSelected?.id);
      return (listed ? of(listed) :
        this.apiTasks.tasksGetAllEx({id: [selected.id], only_fields: ['last_update']}).pipe(map(res => res.tasks[0])))
        .pipe(map(task => {
          return [action, task.last_update, task, selected]}
          ));
    }),
    filter(([action, updateTime, tableSelected, selected]) => (action.type !== commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO || tableSelected?.id === selected?.id)),
    // Can't have filter here because we need to deactivate loader
    // filter(([action, selected, updateTime]) => !selected || new Date(selected.last_update) < new Date(updateTime)),
    switchMap(([action, updateTime, tableSelected, selected]) => {
      // else will deactivate loader
      if (!updateTime || (new Date(this.previousSelectedLastUpdate) < new Date(updateTime)) || action.type === commonInfoActions.EXPERIMENT_UPDATED_SUCCESSFULLY) {
        return [
          commonInfoActions.getExperiment({experimentId: action.payload}),
          commonInfoActions.getExperimentUncommittedChanges({experimentId: action.payload})
        ];
      } else {
        return [new DeactiveLoader(action.type)];
      }
    }
    )
  );

  @Effect()
  fetchExperiment$ = this.actions$.pipe(
    ofType(commonInfoActions.getExperiment),
    switchMap((action) =>
      this.apiTasks.tasksGetAllEx({id: [action.experimentId], only_fields: EXPERIMENT_INFO_ONLY_FIELDS})
        .pipe(
          flatMap(res => {
            let experiment = res.tasks[0];
            this.previousSelectedLastUpdate = experiment.last_update;
            if (experiment) {
              experiment = convertStopToComplete([experiment])[0];
              return [
                new commonInfoActions.SetExperimentInfoData(this.reverter.revertExperiment(experiment)),
                new commonInfoActions.SetExperiment(experiment),
                new UpdateExperiment({id: action.experimentId, changes: experiment}),
                new DeactiveLoader(action.type),
                new DeactiveLoader(commonInfoActions.GET_EXPERIMENT_INFO),
              ];
            } else {
              return [
                new SetServerError('Experiment not found'),
                new DeactiveLoader(action.type),
                new SetServerError('Experiment not Found', null, 'Fetch experiment failed',
                  action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
              ];
            }
          }),
          catchError(error => {
            console.log(error);
            return [
              new RequestFailed(error),
              new DeactiveLoader(action.type),
              new DeactiveLoader(commonInfoActions.GET_EXPERIMENT_INFO),
              new SetServerError(error, null, 'Fetch experiment failed',
                action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
            ];
          })
        )
    )
  );

  @Effect()
  fetchDiff$ = this.actions$.pipe(
    ofType(commonInfoActions.getExperimentUncommittedChanges),
    switchMap((action) =>
      this.apiTasks.tasksGetAllEx({id: [action.experimentId], only_fields: ['script.diff']})
        .pipe(
          flatMap(res => {
            const experiment = res.tasks[0];
            return [commonInfoActions.setExperimentUncommittedChanges({diff: experiment?.script?.diff})];
          }),
          catchError(() => [commonInfoActions.setExperimentUncommittedChanges({diff: ''})])
        )
    )
  );

  @Effect()
  // Changes fields which can be applied regardless of experiment draft state i.e name, comments, tags
  updateExperimentDetails$ = this.actions$.pipe(
    ofType<infoActions.ExperimentDetailsUpdated>(infoActions.EXPERIMENT_DETAILS_UPDATED),
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentFormValidity)
    ),
    filter(([action, infoData, selectedExperiment, valid]) => valid),
    flatMap(([action, infoData, selectedExperiment]) =>
      this.apiTasks.tasksUpdate({task: action.payload.id, ...action.payload.changes})
        .pipe(
          flatMap((res) => {
            const changes = res?.fields || action.payload.changes;
            return [
              new commonInfoActions.ExperimentUpdatedSuccessfully(action.payload.id),
              new UpdateExperiment({id: action.payload.id, changes}),
              selectedExperiment?.id === action.payload.id ? new commonInfoActions.UpdateExperimentInfoData({id: action.payload.id, changes}) : new EmptyAction()
            ];
          }),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err, null, 'Update Experiment failed'),
            new commonInfoActions.GetExperimentInfo(action.payload.id)
          ])
        )
    )
  );

  @Effect()
  saveExperimentData$ = this.actions$.pipe(
    ofType<infoActions.SaveExperiment>(infoActions.EXPERIMENT_SAVE),
    // Changes fields which can be applied Only on draft mode experiment
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentInfoDataFreeze),
      this.store.select(selectExperimentFormValidity),
    ),
    filter(([action, infoData, selectedExperiment, infoFreeze, valid]) => valid),
    switchMap(([action, infoData, selectedExperiment, infoFreeze]) =>
      this.apiTasks.tasksEdit(this.converter.convertExperiment(infoData, selectedExperiment, infoFreeze))
        .pipe(
          flatMap((res) => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new SetBackdrop(false)
            // new viewActions.UpdateExperiment({id: action.payload.id, changes: action.payload.changes}),
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new infoActions.CancelExperimentEdit(),
            new SetBackdrop(false)
          ])
        )
    ),
    shareReplay(1)
  );

  @Effect()
  saveExperimentHyperParams$ = this.actions$.pipe(
    ofType(saveHyperParamsSection),
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentInfoDataFreeze),
      this.store.select(selectExperimentFormValidity),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute)
    ),
    filter(([action, infoData, selectedExperiment, infoFreeze, valid, projectId, section]) => valid),
    switchMap(([action, infoData, selectedExperiment, infoFreeze, valid, projectId, section]) =>
      this.apiTasks.tasksEditHyperParams({task: selectedExperiment.id, hyperparams: action.hyperparams.length > 0 ? action.hyperparams : [{section}], replace_hyperparams: ReplaceHyperparamsEnum.Section})
        .pipe(
          flatMap((res) => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new SetBackdrop(false)
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new infoActions.CancelExperimentEdit(),
            new SetBackdrop(false)
          ])
        )
    ),
  );

  // @Effect()
  // populateDesignFromModel$ = this.actions$.pipe(
  //   ofType<commonInfoActions.ModelSelected>(commonInfoActions.MODEL_SELECTED),
  //   filter((action) =>{
  //       return action.payload.fieldsToPopulate.networkDesign
  //   }),
  //   flatMap((action)=> [saveExperimentConfigObj({configuration: [{
  //     name:getModelDesign(action.payload.model?.design).key|| 'design',
  //       value: getModelDesign(action.payload.model?.design).value}]})])
  // )


  @Effect()
  saveExperimentConfigObj$ = this.actions$.pipe(
    ofType(saveExperimentConfigObj),
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperimentFromRouter),
      this.store.select(selectExperimentInfoDataFreeze),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute)
    ),
    switchMap(([action, infoData, selectedExperiment, infoFreeze, projectId, section]) =>
      this.apiTasks.tasksEditConfiguration({task: selectedExperiment, configuration: action.configuration})
        .pipe(
          flatMap((res) => [
            commonInfoActions.getExperimentConfigurationObj(),
            commonInfoActions.setExperimentSaving({saving:false}),
            new SetBackdrop(false)
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err),
            commonInfoActions.getExperimentConfigurationObj(),
            commonInfoActions.setExperimentSaving({saving:false}),
            new infoActions.CancelExperimentEdit(),
            new SetBackdrop(false)
          ])
        )
    ),
  );

  @Effect()
  deleteExperimentHyperParamsSection$ = this.actions$.pipe(
    ofType(deleteHyperParamsSection),
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentInfoDataFreeze),
      this.store.select(selectExperimentFormValidity),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute)
    ),
    filter(([action, infoData, selectedExperiment, infoFreeze, valid, projectId, section]) => valid),
    switchMap(([action, infoData, selectedExperiment, infoFreeze, valid, projectId, section]) =>
      this.apiTasks.tasksDeleteHyperParams({task: selectedExperiment.id, hyperparams: [{section: action.section}]})
        .pipe(
          tap(() => this.router.navigateByUrl(this.router.url.replace('/hyper-param/' + section, ''))),
          flatMap((res) => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new SetBackdrop(false)
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new infoActions.CancelExperimentEdit(),
            new SetBackdrop(false)
          ])
        )
    ),
  );


}
