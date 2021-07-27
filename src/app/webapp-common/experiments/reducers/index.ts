import {createSelector} from '@ngrx/store';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {experimentInfo, experimentOutput, experimentsView, selectExperimentInfoData, selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentInfo} from '../../../features/experiments/shared/experiment-info.model';
import {experimentSectionsEnum} from '../../../features/experiments/shared/experiments.const';
import {GroupByCharts, IExperimentSettings} from './common-experiment-output.reducer';
import {get, getOr} from 'lodash/fp';
import {TaskStatusEnum} from '../../../business-logic/model/tasks/taskStatusEnum';
import {IExecutionForm} from '../../../features/experiments/shared/experiment-execution.model';
import {ICommonExperimentInfoState} from './common-experiment-info.reducer';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {IExperimentModelInfo} from '../shared/common-experiment-model.model';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';
import {ParamsItem} from '../../../business-logic/model/tasks/paramsItem';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import { CountAvailableAndIsDisableSelectedFiltered } from '../../shared/entity-page/items.utils';
import {commonExperimentsInitialState} from '@common/experiments/reducers/common-experiments-view.reducer';
import {modelsInitialState} from '@common/models/reducers/models-view.reducer';

export const selectExperimentsList = createSelector(experimentsView, (state): ITableExperiment[] => state.experiments);
export const selectSelectedTableExperiment = createSelector(experimentsView, (state): ITableExperiment => state.selectedExperiment);

export const selectExperimentsTableColsWidth = createSelector(experimentsView, selectSelectedProjectId,
  (state, projectId) => state.projectColumnsWidth?.[projectId] || {});
export const selectExperimentsHiddenTableCols = createSelector(experimentsView, selectSelectedProjectId,
  (state, projectId) => state.hiddenProjectTableCols?.[projectId] || commonExperimentsInitialState.hiddenTableCols);
export const selectRawExperimentsTableCols = createSelector(experimentsView, (state) => state.tableCols);
export const selectExperimentsTableCols = createSelector(selectRawExperimentsTableCols, selectExperimentsHiddenTableCols, selectExperimentsTableColsWidth,
  (cols, hidden, colWidth) =>
    cols?.map(col => ({
      ...col,
      hidden: !!hidden[col.id],
      style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
    } as ISmCol)));
export const selectExperimentsTags = createSelector(experimentsView, (state) => state.projectTags);
export const selectExperimentsUsers = createSelector(experimentsView, (state) => state.users);
export const selectExperimentsParents = createSelector(experimentsView, (state) => state.parents);
export const selectActiveParentsFilter = createSelector(experimentsView, (state) => state.activeParentsFilter);
export const selectExperimentsTypes = createSelector(experimentsView, (state) => state.types);

export const selectExperimentsTableColsOrder = createSelector([experimentsView, selectSelectedProjectId], (state, projectId): string[] => (state.colsOrder && projectId) ? state.colsOrder[projectId] : undefined);
export const selectExperimentsMetricsCols = createSelector(experimentsView, (state) => state.metricsCols);
export const selectExperimentsMetricsColsForProject = createSelector([experimentsView, selectRouterParams, selectExperimentsHiddenTableCols, selectExperimentsTableColsWidth], (state, params,hidden, colWidth) =>
  state.metricsCols
    .filter(metricCol=> metricCol.projectId === params?.projectId)
    .map(col => ({
      ...col,
      hidden: !!hidden[col.id],
      style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
    } as ISmCol))
);
export const selectCurrentPage = createSelector(experimentsView, (state): number => state.page);
export const selectSplitSize = createSelector(experimentsView, (state): number => state.splitSize);

export const selectGlobalFilter = createSelector(experimentsView, (state) => state.globalFilter);
export const selectTableSortFields = createSelector(experimentsView, selectSelectedProjectId,
  (state, projectId) => state.projectColumnsSortOrder?.[projectId] || state.tableOrders);
export const selectTableFilters = createSelector(experimentsView, selectSelectedProjectId,
  (state, projectId) => state.projectColumnFilters?.[projectId] || {});
export const selectSelectedExperiments = createSelector(experimentsView, (state): Array<any> => state.selectedExperiments);
export const selectedExperimentsDisableAvailable = createSelector(experimentsView, (state): Record<string, CountAvailableAndIsDisableSelectedFiltered> => state.selectedExperimentsDisableAvailable);
export const selectShowAllSelectedIsActive = createSelector(experimentsView, (state): boolean => state.showAllSelectedIsActive);
export const selectNoMoreExperiments = createSelector(experimentsView, (state): boolean => state.noMoreExperiment);

export const selectExperimentInfoDataFreeze = createSelector(experimentInfo, (state): IExperimentInfo => state.infoDataFreeze);
export const selectExperimentInfoErrors = createSelector(experimentInfo, (state): ICommonExperimentInfoState['errors'] => state.errors);
export const selectIsSelectedExperimentInDev = createSelector(experimentInfo, () => false);
export const selectIsExperimentSaving = createSelector(experimentInfo, (state): boolean => state.saving);
export const selectIsExperimentInEditMode = createSelector(experimentInfo, (state): boolean => state.activeSectionEdit);
export const selectCurrentActiveSectionEdit = createSelector(experimentInfo, (state): string => state.currentActiveSectionEdit);

export const selectExperimentLog = createSelector(experimentOutput, (state) => state.experimentLog);
export const selectExperimentBeginningOfLog = createSelector(experimentOutput, (state) => state.beginningOfLog);
export const selectExperimentInfoPlots = createSelector(experimentOutput, (state) => state.metricsPlotsCharts);
export const selectExperimentHistogramCacheAxisType = createSelector(experimentOutput, (state) => state.cachedAxisType);
export const selectExperimentMetricsSearchTerm = createSelector(experimentOutput, (state) => state.searchTerm);
export const selectHyperParamsVariants = createSelector(experimentsView, (state): Array<any> => state.hyperParams);
export const selectHyperParamsOptions = createSelector(experimentsView, (state): Record<ISmCol['id'], string[]> => state.hyperParamsOptions);

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
export const selectSelectedSettingsGroupBy = createSelector(selectSelectedExperimentSettings,
  (settings): GroupByCharts => settings?.groupBy || 'metric');
export const selectIsExperimentInProgress = createSelector(selectSelectedExperiment,
  (experiment): boolean => experiment && (experiment.status === TaskStatusEnum.InProgress));

export const selectExperimentModelInfoData = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentModelInfo => get('model', info));

export const selectExperimentExecutionInfoData = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExecutionForm => get('execution', info));

export const selectExperimentHyperParamsInfoData = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentInfo['hyperparams'] => info?.hyperparams);

export const selectExperimentConfiguration = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentInfo['configuration'] => info?.configuration);

export const selectExperimentHyperParamsSelectedSectionFromRoute = createSelector(selectRouterParams,
  (params): string => decodeURIComponent(params?.hyperParamId));

export const selectExperimentSelectedConfigObjectFromRoute = createSelector(selectRouterParams,
  (params): string => decodeURIComponent(params?.configObject));


export const selectSelectedExperimentFromRouter = createSelector(selectRouterParams,
  (params): string => get('experimentId', params));

export const selectExperimentConfigObj =
  createSelector(selectExperimentConfiguration, selectExperimentSelectedConfigObjectFromRoute,
    (configuration: IExperimentInfo['configuration'], configObj: string): any =>getOr(null,configObj, configuration ) );



export const selectExperimentHyperParamsSelectedSectionParams =
  createSelector(selectExperimentHyperParamsInfoData, selectExperimentHyperParamsSelectedSectionFromRoute,
    (hyperparams: IExperimentInfo['hyperparams'], section: string): ParamsItem[] => Object.entries(getOr({},section,hyperparams)).map(([, value]) => value));


export const selectExperimentInfoHistograms = createSelector(
  selectSelectedSettingsxAxisType,
  experimentOutput,
  (axisType, state) => {
    if (axisType === ScalarKeyEnum.IsoTime && state.metricsHistogramCharts) {
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
