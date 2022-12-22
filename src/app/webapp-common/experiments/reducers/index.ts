import {createSelector, Store} from '@ngrx/store';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {ISmCol, TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import {
  experimentInfo,
  experimentOutput,
  experimentsView,
  selectExperimentInfoData,
  selectSelectedExperiment
} from '~/features/experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {EXPERIMENTS_TABLE_COL_FIELDS, experimentSectionsEnum} from '~/features/experiments/shared/experiments.const';
import {ExperimentSettings} from './common-experiment-output.reducer';
import {get, getOr} from 'lodash/fp';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {CommonExperimentInfoState} from './common-experiment-info.reducer';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {ParamsItem} from '~/business-logic/model/tasks/paramsItem';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {commonExperimentsInitialState} from '@common/experiments/reducers/common-experiments-view.reducer';
import {
  selectCompareAddTableFilters,
  selectCompareAddTableSortFields,
  selectIsCompare
} from '../../experiments-compare/reducers';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {
  EventsGetTaskSingleValueMetricsResponseValues
} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {ChartHoverModeEnum} from '../shared/common-experiments.const';

export const selectExperimentsList = createSelector(experimentsView, (state): ITableExperiment[] => state.experiments);
export const selectTableRefreshList = createSelector(experimentsView, (state): boolean => !!state.refreshList);
export const selectSelectedTableExperiment = createSelector(experimentsView, (state): ITableExperiment => state.selectedExperiment);

export const selectExperimentsTableColsWidth = createSelector(experimentsView, selectRouterParams,
  (state, params) => state.projectColumnsWidth?.[params?.projectId] ?? {});
export const selectExperimentsHiddenTableCols = createSelector(experimentsView, selectRouterParams,
  (state, params) => state.hiddenProjectTableCols?.[params?.projectId] ?? commonExperimentsInitialState.hiddenTableCols);
export const selectRawExperimentsTableCols = createSelector(experimentsView, (state) => state.tableCols);
export const selectExperimentsTableCols = createSelector(selectRawExperimentsTableCols, selectExperimentsHiddenTableCols, selectExperimentsTableColsWidth,
  (cols, hidden, colWidth) =>
    cols?.map(col => ({
      ...col,
      hidden: !!hidden[col.id],
      style: {...col.style, ...(col.id !== EXPERIMENTS_TABLE_COL_FIELDS.SELECTED && colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
    } as ISmCol)));
export const selectExperimentsTags = createSelector(experimentsView, (state) => state.projectTags);
export const selectExperimentsParents = createSelector(experimentsView, (state) => state.parents);
export const selectActiveParentsFilter = createSelector(experimentsView, (state) => state.activeParentsFilter);
export const selectExperimentsTypes = createSelector(experimentsView, (state) => state.types);

export const selectExperimentsTableColsOrder = createSelector([experimentsView, selectRouterParams], (state, params): string[] =>
  (state.colsOrder && params?.projectId) ? state.colsOrder[params?.projectId] : undefined);
export const selectExperimentsMetricsCols = createSelector(experimentsView, (state) => state.metricsCols);
export const selectExperimentsMetricsColsForProject = createSelector([experimentsView, selectRouterParams, selectExperimentsHiddenTableCols, selectExperimentsTableColsWidth], (state, params, hidden, colWidth) =>
  state.metricsCols
    .filter(metricCol => metricCol.projectId === params?.projectId)
    .map(col => ({
      ...col,
      hidden: !!hidden[col.id],
      style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
    } as ISmCol))
);

export const getCustomColumns$ = (store: Store) => combineLatest([
  store.select(selectRouterParams)
    .pipe(
      map(params => params?.projectId),
      distinctUntilChanged(),
    ),
  store.select(selectExperimentsMetricsCols),
  store.select(selectExperimentsHiddenTableCols),
  store.select(selectExperimentsTableColsWidth),
])
  .pipe(
    map(([projectId, custom, hidden, colWidth]) =>
      custom
        .filter(metricCol => metricCol.projectId === projectId)
        .map(col => ({
          ...col,
          hidden: !!hidden[col.id],
          style: {...col.style, ...(colWidth[col.id] && {width: `${colWidth[col.id]}px`})}
        } as ISmCol))
    )
  );

export const selectCurrentScrollId = createSelector(experimentsView, (state): string => state.scrollId);
export const selectSplitSize = createSelector(experimentsView, (state): number => state.splitSize);
export const selectGlobalFilter = createSelector(experimentsView, (state) => state.globalFilter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const selectInitTableOrders = createSelector(experimentsView, (state): SortMeta[] => ([{
  field: EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE,
  order: TABLE_SORT_ORDER.DESC
}]));
export const selectTableSortFields = createSelector(
  experimentsView, selectRouterParams, selectIsCompare, selectCompareAddTableSortFields, selectInitTableOrders,
  (state, params, isCompare, compareSortFields, initTableOrders): SortMeta[] =>
    (isCompare ? compareSortFields : (state.projectColumnsSortOrder?.[params?.projectId])) ?? initTableOrders
);
export const selectTableFilters = createSelector(
  experimentsView, selectRouterParams, selectIsCompare, selectCompareAddTableFilters,
  (state, params, isCompare, compareFilters) =>
    isCompare ? compareFilters : state.projectColumnFilters?.[params?.projectId] ?? {} as { [columnId: string]: FilterMetadata });

export const selectSelectedExperiments = createSelector(experimentsView, state => state.selectedExperiments);
export const selectedExperimentsDisableAvailable = createSelector(experimentsView, (state) => state.selectedExperimentsDisableAvailable);
export const selectShowAllSelectedIsActive = createSelector(experimentsView, (state): boolean => state.showAllSelectedIsActive);
export const selectNoMoreExperiments = createSelector(experimentsView, (state): boolean => state.noMoreExperiment);
export const selectTableMode = createSelector(experimentsView, state => state.tableMode);

export const selectExperimentInfoDataFreeze = createSelector(experimentInfo, (state): IExperimentInfo => state.infoDataFreeze);
export const selectExperimentInfoErrors = createSelector(experimentInfo, (state): CommonExperimentInfoState['errors'] => state.errors);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const selectIsSelectedExperimentInDev = createSelector(experimentInfo, info => false);
export const selectIsExperimentSaving = createSelector(experimentInfo, (state): boolean => state.saving);
export const selectIsExperimentInEditMode = createSelector(experimentInfo, (state): boolean => state.activeSectionEdit);
export const selectCurrentActiveSectionEdit = createSelector(experimentInfo, (state): string => state.currentActiveSectionEdit);

export const selectExperimentLog = createSelector(experimentOutput, state => state.experimentLog);
export const selectExperimentBeginningOfLog = createSelector(experimentOutput, (state) => state.beginningOfLog);
export const selectExperimentInfoPlots = createSelector(experimentOutput, (state) => state.metricsPlotsCharts);
export const selectExperimentHistogramCacheAxisType = createSelector(experimentOutput, (state) => state.cachedAxisType);
export const selectExperimentMetricsSearchTerm = createSelector(experimentOutput, (state) => state.searchTerm);
export const selectScalarsHoverMode = createSelector(experimentOutput, (state): ChartHoverModeEnum => state.scalarsHoverMode);

export const selectGraphsPerRow = createSelector(experimentOutput, state => state.graphsPerRow);
export const selectHyperParamsVariants = createSelector(experimentsView, state => state.hyperParams);
export const selectHyperParamsOptions = createSelector(experimentsView, (state): Record<ISmCol['id'], string[]> => state.hyperParamsOptions);
export const selectPipelineSelectedStep = createSelector(experimentInfo, state => state.selectedPipelineStep);
export const selectStartPipelineDialogTask = createSelector(experimentInfo, state => state.pipelineRunDialogTask);

export const selectExperimentUserKnowledge = createSelector(experimentInfo,
  (state): Map<experimentSectionsEnum, boolean> => state.userKnowledge);

export const selectLogFilter = createSelector(experimentOutput, (state) => state.logFilter);
export const selectLogLoading = createSelector(experimentOutput, (state) => state.logLoading);

export const selectTotalLogLines = createSelector(experimentOutput, (state) => state.totalLogLines);

export const selectShowSettings = createSelector(experimentOutput, (state) => state.showSettings);
export const selectSelectedExperimentSettings = createSelector(experimentOutput, selectSelectedExperiment,
  (output, currentExperiment): ExperimentSettings => output.settingsList && output.settingsList.find((setting) => currentExperiment && setting.id === currentExperiment.id));
export const selectSelectedSettingsHiddenPlot = createSelector(selectSelectedExperimentSettings,
  settings => settings?.hiddenMetricsPlot ?? []);
export const selectSelectedSettingsHiddenScalar = createSelector(selectSelectedExperimentSettings,
  settings => settings?.hiddenMetricsScalar ?? []);
export const selectSelectedSettingsSmoothWeight = createSelector(selectSelectedExperimentSettings,
  settings => settings?.smoothWeight ?? 0);

export const selectSelectedSettingsxAxisType = createSelector(selectSelectedExperimentSettings,
  settings => settings?.xAxisType ?? ScalarKeyEnum.Iter as ScalarKeyEnum);

export const selectSelectedSettingsGroupBy = createSelector(selectSelectedExperimentSettings,
  settings => settings?.groupBy ?? 'metric');
export const selectIsExperimentInProgress = createSelector(selectSelectedExperiment,
  experiment => experiment && (experiment.status === TaskStatusEnum.InProgress));

export const selectExperimentModelInfoData = createSelector(selectExperimentInfoData, info => info?.model);

export const selectExperimentExecutionInfoData = createSelector(selectExperimentInfoData, info => info?.execution);

export const selectExperimentHyperParamsInfoData = createSelector(selectExperimentInfoData, info => info?.hyperparams);

export const selectExperimentConfiguration = createSelector(selectExperimentInfoData,
  (info: IExperimentInfo): IExperimentInfo['configuration'] => info?.configuration);

export const selectExperimentHyperParamsSelectedSectionFromRoute = createSelector(selectRouterParams,
  (params): string => params?.hyperParamId && decodeURIComponent(params?.hyperParamId));


export const selectExperimentSelectedConfigObjectFromRoute = createSelector(selectRouterParams,
  (params): string => params?.configObject && decodeURIComponent(params?.configObject));


export const selectSelectedExperimentFromRouter = createSelector(selectRouterParams,
  (params): string => get('experimentId', params));

export const selectExperimentConfigObj =
  createSelector(selectExperimentConfiguration, selectExperimentSelectedConfigObjectFromRoute,
    (configuration: IExperimentInfo['configuration'], configObj: string): any => getOr(null, configObj, configuration));


export const selectExperimentHyperParamsSelectedSectionParams =
  createSelector(selectExperimentHyperParamsInfoData, selectExperimentHyperParamsSelectedSectionFromRoute,
    (hyperparams: IExperimentInfo['hyperparams'], section: string): ParamsItem[] => Object.entries(getOr({}, section, hyperparams)).map(([, value]) => value));
export const selectScalarSingleValue = createSelector(experimentOutput, (state): Array<EventsGetTaskSingleValueMetricsResponseValues> => state.scalarSingleValue);


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

export const selectCurrentArtifactExperimentId = createSelector(experimentInfo, state => state.artifactsExperimentId);

