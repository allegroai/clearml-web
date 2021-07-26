import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {catchError, filter, map, mergeMap, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {getExperimentInfoOnlyFields} from '../../../features/experiments/experiments.consts';
import {selectExperimentFormValidity, selectExperimentInfoData, selectExperimentInfoDataFreeze, selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {ExperimentReverterService} from '../../../features/experiments/shared/services/experiment-reverter.service';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, deactivateLoader, setBackdrop, setServerError} from '../../core/actions/layout.actions';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import * as commonInfoActions from '../actions/common-experiments-info.actions';
import {
  CancelExperimentEdit, deleteHyperParamsSection, EXPERIMENT_DETAILS_UPDATED, EXPERIMENT_SAVE,
  ExperimentDetailsUpdated, getExperimentConfigurationNames, getExperimentConfigurationObj,
  SaveExperiment, saveExperimentConfigObj, saveHyperParamsSection, saveExperimentSection,
  DeactivateEdit, setExperimentSaving
} from '../actions/common-experiments-info.actions';
import {updateExperiment} from '../actions/common-experiments-view.actions';
import {
  selectExperimentConfiguration, selectExperimentHyperParamsSelectedSectionFromRoute, selectExperimentSelectedConfigObjectFromRoute, selectExperimentsList, selectSelectedExperimentFromRouter,
  selectSelectedTableExperiment
} from '../reducers';
import {convertStopToComplete} from '../shared/common-experiments.utils';
import {ExperimentConverterService} from '../../../features/experiments/shared/services/experiment-converter.service';
import {of} from 'rxjs';
import {EmptyAction} from '../../../app.constants';
import {ReplaceHyperparamsEnum} from '../../../business-logic/model/tasks/replaceHyperparamsEnum';
import {Router} from '@angular/router';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {cloneDeep, get} from 'lodash/fp';
import {CommonExperimentReverterService} from '../shared/services/common-experiment-reverter.service';
import {setExperimentLog} from '../actions/common-experiment-output.actions';
import {HttpErrorResponse} from '@angular/common/http';
import {selectHasDataFeature} from '../../../core/reducers/users.reducer';


@Injectable()
export class CommonExperimentsInfoEffects {
  private previousSelectedLastUpdate: Date = null;
  private previousSelectedId: string;


  constructor(
    private actions$: Actions,
    private store: Store<IExperimentInfoState>,
    private apiTasks: ApiTasksService,
    private reverter: ExperimentReverterService,
    private converter: ExperimentConverterService,
    private router: Router,
    private commonExperimentReverterService: CommonExperimentReverterService
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(commonInfoActions.GET_EXPERIMENT_INFO),
    map(action => activeLoader(action.type))
  ));

  getExperimentConfigurationNames$ = createEffect(() => this.actions$.pipe(
    ofType(getExperimentConfigurationNames),
    withLatestFrom(
      this.store.select(selectSelectedExperimentFromRouter),
      this.store.select(selectExperimentConfiguration),
      this.store.select(selectExperimentSelectedConfigObjectFromRoute)
    ),
    filter(([action, experimentId, configuration, selectedConfiguration]) => !!experimentId),
    switchMap(([action, experimentId, configuration, selectedConfiguration]) => this.apiTasks.tasksGetConfigurationNames({tasks: [experimentId]})
      .pipe(
        mergeMap(res => {
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
            selectedConfiguration ? getExperimentConfigurationObj() : new EmptyAction(),
            deactivateLoader(action.type),
          ];
        }),
        catchError(error => {
          console.log(error);
          return [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, 'Fetch configuration names failed',
              action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
          ];
        })
      )
    )
  ));

  getExperimentConfigurationObj$ = createEffect(() => this.actions$.pipe(
    ofType(getExperimentConfigurationObj),
    withLatestFrom(
      this.store.select(selectSelectedExperimentFromRouter),
      this.store.select(selectExperimentConfiguration),
      this.store.select(selectExperimentSelectedConfigObjectFromRoute)
    ),
    filter(([action, experimentId, configuration, configObj]) => configuration && configObj && (configObj in configuration)),
    switchMap(([action, experimentId, configuration, configObj]) => this.apiTasks.tasksGetConfigurations({tasks: [experimentId], names: [configObj]})
      .pipe(
        mergeMap((res: any) => {
          const configurationObj = cloneDeep(configuration);
          configurationObj[configObj] = res.configurations[0].configuration[0];
          return [
            new commonInfoActions.UpdateExperimentInfoData({id: experimentId, changes: {configuration: configurationObj}}),
            deactivateLoader(action.type),
            setBackdrop({payload: false}),
            new DeactivateEdit(),
            setExperimentSaving({saving: false})
          ];
        }),
        catchError(error => {
          console.log(error);
          return [
            requestFailed(error),
            deactivateLoader(action.type),
            setBackdrop({payload: false}),
            new DeactivateEdit(),
            setExperimentSaving({saving: false}),
            setServerError(error, null, 'Fetch configuration failed',
              action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
          ];
        })
      )
    )
  ));

  getExperimentInfo$ = createEffect(() => this.actions$.pipe(
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
        this.apiTasks.tasksGetByIdEx({id: [selected.id], only_fields: ['last_change']}).pipe(map(res => res.tasks[0])))
        .pipe(map(task => [action, task?.last_change ?? task?.last_update, task, selected]));
    }),
    filter(([action, , tableSelected, selected]) => (action.type !== commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO || (!tableSelected) ||  (tableSelected?.id === selected?.id))),
    // Can't have filter here because we need to deactivate loader
    // filter(([action, selected, updateTime]) => !selected || new Date(selected.last_change) < new Date(updateTime)),
    switchMap(([action, updateTime, tableSelected, selected]) => {
      // else will deactivate loader
      if (!updateTime || (new Date(this.previousSelectedLastUpdate) < new Date(updateTime)) || action.type === commonInfoActions.EXPERIMENT_UPDATED_SUCCESSFULLY) {
        return [
          commonInfoActions.getExperiment({experimentId: action.payload}),
          commonInfoActions.getExperimentUncommittedChanges({
            experimentId: action.payload,
            autoRefresh: action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO
          }),
          // clear log data if experiment was restarted
          ...(selected?.started && tableSelected?.started && selected.started != tableSelected?.started ? [setExperimentLog({direction: null, events: [], total: 0})] : [])
        ];
      } else {
        return [deactivateLoader(action.type)];
      }
    })
  ));

  fetchExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(commonInfoActions.getExperiment),
    withLatestFrom(this.store.select(selectHasDataFeature)),
    switchMap(([action, hasDataFeature]) =>
      this.apiTasks.tasksGetByIdEx({id: [action.experimentId], only_fields: getExperimentInfoOnlyFields(hasDataFeature)})
        .pipe(
          mergeMap(res => {
            let experiment = res.tasks[0];
            if (experiment) {
              this.previousSelectedLastUpdate = experiment.last_change;
              experiment = convertStopToComplete([experiment])[0];
              experiment = this.commonExperimentReverterService.revertReadOnly(experiment);
              return [
                new commonInfoActions.SetExperimentInfoData(this.reverter.revertExperiment(experiment)),
                new commonInfoActions.SetExperiment(experiment),
                updateExperiment({id: action.experimentId, changes: experiment}),
                deactivateLoader(action.type),
                deactivateLoader(commonInfoActions.GET_EXPERIMENT_INFO),
                setBackdrop({payload: false}),
                new DeactivateEdit(),
                setExperimentSaving({saving: false})
              ];
            } else {
              this.router.navigate(['dashboard']);
              return [deactivateLoader(action.type)];
            }
          }),
          catchError(error => {
            return [
              requestFailed(error),
              deactivateLoader(action.type),
              deactivateLoader(commonInfoActions.GET_EXPERIMENT_INFO),
              setServerError(error, null, 'Fetch experiment failed',
                action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
            ];
          })
        )
    )
  ));

  fetchDiff$ = createEffect(() => this.actions$.pipe(
    ofType(commonInfoActions.getExperimentUncommittedChanges),
    switchMap((action) =>
      this.apiTasks.tasksGetByIdEx({id: [action.experimentId], only_fields: ['script.diff']})
        .pipe(
          mergeMap(res => {
            const experiment = res.tasks[0];
            return [commonInfoActions.setExperimentUncommittedChanges({diff: experiment?.script?.diff})];
          }),
          catchError(() => [commonInfoActions.setExperimentUncommittedChanges({diff: ''})])
        )
    )
  ));

  // Changes fields which can be applied regardless of experiment draft state i.e name, comments, tags
  updateExperimentDetails$ = createEffect(() => this.actions$.pipe(
    ofType<ExperimentDetailsUpdated>(EXPERIMENT_DETAILS_UPDATED),
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentFormValidity)
    ),
    filter(([action, infoData, selectedExperiment, valid]) => valid),
    mergeMap(([action, infoData, selectedExperiment]) =>
      this.apiTasks.tasksUpdate({task: action.payload.id, ...action.payload.changes})
        .pipe(
          mergeMap((res) => {
            const changes = res?.fields || action.payload.changes;
            return [
              new commonInfoActions.ExperimentUpdatedSuccessfully(action.payload.id),
              updateExperiment({id: action.payload.id, changes}),
              selectedExperiment?.id === action.payload.id ? new commonInfoActions.UpdateExperimentInfoData({id: action.payload.id, changes}) : new EmptyAction()
            ];
          }),
          catchError((err: HttpErrorResponse) => [
            requestFailed(err),
            setServerError(err, null, 'Update Experiment failed'),
            new commonInfoActions.GetExperimentInfo(action.payload.id)
          ])
        )
    )
  ));

  saveExperimentData$ = createEffect(() => this.actions$.pipe(
    ofType<SaveExperiment>(EXPERIMENT_SAVE),
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
          mergeMap(() => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new CancelExperimentEdit(),
            setBackdrop({payload: false})
          ])
        )
    ),
    shareReplay(1)
  ));

  saveExperimentSectionData$ = createEffect(() => this.actions$.pipe(
    ofType(saveExperimentSection),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedExperiment]) => {
      const {type, parent, ...changes} = action;
      return this.apiTasks.tasksEdit({task: selectedExperiment.id, ...changes, ...(parent && {parent: parent.id})})
        .pipe(
          mergeMap(() => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new CancelExperimentEdit(),
            setBackdrop({payload: false})
          ])
        );
    }),
  ));

  saveExperimentHyperParams$ = createEffect(() => this.actions$.pipe(
    ofType(saveHyperParamsSection),
    withLatestFrom(
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentFormValidity),
      this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute)
    ),
    filter(([action, selectedExperiment, valid, section]) => valid),
    switchMap(([action, selectedExperiment, valid, section]) =>
      this.apiTasks.tasksEditHyperParams({
        task: selectedExperiment.id,
        hyperparams: action.hyperparams.length > 0 ? action.hyperparams : [{section}],
        replace_hyperparams: ReplaceHyperparamsEnum.Section
      })
        .pipe(
          mergeMap(() => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new CancelExperimentEdit(),
            setBackdrop({payload: false})
          ])
        )
    ),
  ));

  saveExperimentConfigObj$ = createEffect(() => this.actions$.pipe(
    ofType(saveExperimentConfigObj),
    withLatestFrom(
      this.store.select(selectSelectedExperimentFromRouter),
    ),
    switchMap(([action, selectedExperiment]) =>
      this.apiTasks.tasksEditConfiguration({task: selectedExperiment, configuration: action.configuration})
        .pipe(
          mergeMap(() => [
            commonInfoActions.getExperimentConfigurationObj(),
            // commonInfoActions.setExperimentSaving({saving: false}),
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err),
            commonInfoActions.getExperimentConfigurationObj(),
            commonInfoActions.setExperimentSaving({saving: false}),
            new CancelExperimentEdit(),
            setBackdrop({payload: false})
          ])
        )
    ),
  ));

  deleteExperimentHyperParamsSection$ = createEffect(() => this.actions$.pipe(
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
          mergeMap((res) => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(selectedExperiment.id),
            new CancelExperimentEdit(),
            setBackdrop({payload: false})
          ])
        )
    ),
  ));

}
