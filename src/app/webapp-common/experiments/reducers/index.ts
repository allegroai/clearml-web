import {createSelector} from '@ngrx/store';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {experimentInfo, experimentOutput, experimentsView, selectExperimentInfoData, selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentInfo, ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {experimentSectionsEnum} from '../../../features/experiments/shared/experiments.const';
import {IExperimentSettings} from './common-experiment-output.reducer';
import {get, getOr} from 'lodash/fp';
import {TaskStatusEnum} from '../../../business-logic/model/tasks/taskStatusEnum';
import {IExecutionForm} from '../../../features/experiments/shared/experiment-execution.model';
import {ExperimentsViewModesEnum} from '../shared/common-experiments.const';
import {ICommonExperimentInfoState} from './common-experiment-info.reducer';
import {IHyperParamsForm} from '../shared/experiment-hyper-params.model';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {IExperimentModelInfo} from '../shared/common-experiment-model.model';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';
import {ParamsItem} from '../../../business-logic/model/tasks/paramsItem';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {map} from 'rxjs/operators';

export const selectExperimentsList = createSelector(experimentsView, (state): ITableExperiment[] => state.experiments);
export const selectSelectedTableExperiment = createSelector(experimentsView, (state): ITableExperiment => state.selectedExperiment);

export const selectExperimentsTableCols = createSelector(experimentsView, (state): Array<any> => state.tableCols);
export const selectExperimentsUsers = createSelector(experimentsView, (state): Array<any> => state.users);
export const selectExperimentsTags = createSelector(experimentsView, (state): Array<string> => state.projectTags);
export const selectExperimentsTypes = createSelector(experimentsView, (state): Array<any> => state.types);

export const selectExperimentsTableColsOrder = createSelector([experimentsView, selectSelectedProjectId], (state, projectId): string[] => (state.colsOrder && projectId) ? state.colsOrder[projectId] : undefined);
export const selectExperimentsMetricsCols = createSelector(experimentsView, (state): Array<any> => state.metricsCols);
export const selectExperimentsHiddenTableCols = createSelector(experimentsView, (state): { [key: string]: boolean } => state.hiddenTableCols);
export const selectCurrentPage = createSelector(experimentsView, (state): number => state.page);
export const selectSplitSize = createSelector(experimentsView, (state): number => state.splitSize);

export const selectGlobalFilter = createSelector(experimentsView, (state): string => state.globalFilter);
export const selectTableSortField = createSelector(experimentsView, (state): string => state.tableSortField);
export const selectTableSortOrder = createSelector(experimentsView, (state): TableSortOrderEnum => state.tableSortOrder);
export const selectTableFilters = createSelector(experimentsView, (state) => state.tableFilters);
export const selectViewMode = createSelector(experimentsView, (state): ExperimentsViewModesEnum => state.viewMode);
export const selectSelectedExperiments = createSelector(experimentsView, (state): Array<any> => state.selectedExperiments);
export const selectShowAllSelectedIsActive = createSelector(experimentsView, (state): boolean => state.showAllSelectedIsActive);
export const selectNoMoreExperiments = createSelector(experimentsView, (state): boolean => state.noMoreExperiment);

export const selectExperimentInfoDataFreeze = createSelector(experimentInfo, (state): IExperimentInfo => state.infoDataFreeze);
export const selectExperimentInfoErrors = createSelector(experimentInfo, (state): ICommonExperimentInfoState['errors'] => state.errors);
export const selectIsSelectedExperimentInDev = createSelector(experimentInfo, (state): boolean => false);
export const selectIsExperimentSaving = createSelector(experimentInfo, (state): boolean => state.saving);
export const selectIsExperimentInEditMode = createSelector(experimentInfo, (state): boolean => !!state.activeSectionEdit);

export const selectExperimentLog = createSelector(experimentOutput, (state) => state.experimentLog);
export const selectExperimentBeginningOfLog = createSelector(experimentOutput, (state) => state.beginningOfLog);
export const selectExperimentInfoPlots = createSelector(experimentOutput, (state) => state.metricsPlotsCharts);
export const selectExperimentHistogramCacheAxisType = createSelector(experimentOutput, (state) => state.cachedAxisType);
export const selectExperimentMetricsSearchTerm = createSelector(experimentOutput, (state) => state.searchTerm);
export const selectHyperParamsVariants = createSelector(experimentsView, (state): Array<any> => state.hyperParams);

export const selectExperimentUserKnowledge = createSelector(experimentInfo,
  (state): Map<experimentSectionsEnum, boolean> => state.userKnowledge);

export const selectLogFilter = createSelector(experimentOutput, (state) => state.logFilter);
export const selectTotalLogLines = createSelector(experimentOutput, (state) => state.totalLogLines);

export const selectShowSettings = createSelector(experimentOutput, (state) => state.showSettings);
export const selectSelectedExperimentSettings = createSelector(experimentOutput, selectSelectedExperiment,
  (output, currentExperiment): IExperimentSettings => output.settingsList && output.settingsList.find((setting) => currentExperiment && setting.id === currentExperiment.id));
export const selectSelectedSettingsHiddenPlot = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => get('hiddenMetricsPlot', settings) || []);
export const selectSelectedSettingsHiddenScalar = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => get('hiddenMetricsScalar', settings) || []);
export const selectSelectedSettingsSmoothWeight = createSelector(selectSelectedExperimentSettings,
  (settings): number => get('smoothWeight', settings) || 0);

export const selectSelectedSettingsxAxisType = createSelector(selectSelectedExperimentSettings,
  (settings): ScalarKeyEnum => get('xAxisType', settings) || ScalarKeyEnum.Iter as ScalarKeyEnum);
export const selectIsExperimentInProgress = createSelector(selectSelectedExperiment,
  (experiment: ISelectedExperiment): boolean => experiment && (experiment.status === TaskStatusEnum.InProgress));

export const selectExperimentModelInfoData = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentModelInfo => get('model', info));

export const selectExperimentExecutionInfoData = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExecutionForm => get('execution', info));

export const selectExperimentHyperParamsInfoData = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentInfo['hyperparams'] => info?.hyperparams);

export const selectExperimentConfiguration = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentInfo['configuration'] => info?.configuration);

export const selectExperimentHyperParamsSelectedSectionFromRoute = createSelector(selectRouterParams,
  (params): string => get('hyperParamId', params));

export const selectExperimentSelectedConfigObjectFromRoute = createSelector(selectRouterParams,
  (params): string => get('configObject', params));


export const selectSelectedExperimentFromRouter = createSelector(selectRouterParams,
  (params): string => get('experimentId', params));

export const selectExperimentConfigObj =
  createSelector(selectExperimentConfiguration, selectExperimentSelectedConfigObjectFromRoute,
    (configuration: IExperimentInfo['configuration'], configObj: string): any =>getOr(null,configObj, configuration ) );



export const selectExperimentHyperParamsSelectedSectionParams =
  createSelector(selectExperimentHyperParamsInfoData, selectExperimentHyperParamsSelectedSectionFromRoute,
    (hyperparams: IExperimentInfo['hyperparams'], section: string): ParamsItem[] => Object.entries(getOr({},section,hyperparams)).map(([key, value]) => value));


export const selectExperimentInfoHistograms = createSelector(
  selectSelectedSettingsxAxisType,
  experimentOutput,
  (axisType, state) => {
    if (axisType === ScalarKeyEnum.IsoTime) {
      return Object.keys(state.metricsHistogramCharts).reduce((groupAcc, groupName) => {
        const group = state.metricsHistogramCharts[groupName];
        groupAcc[groupName] = Object.keys(group).reduce((graphAcc, graphName) => {
          const graph = group[graphName];
          graphAcc[graphName] = {...graph, x: graph.x.map(ts => new Date(ts))};
          return graphAcc;
        }, {});
        return groupAcc;
      }, {});
    }
    return state.metricsHistogramCharts;
  });
