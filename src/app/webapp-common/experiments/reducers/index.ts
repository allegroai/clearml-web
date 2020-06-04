import {createSelector} from '@ngrx/store';
import {ExperimentTableColFieldsEnum, ITableExperiment} from '../shared/common-experiment-model.model';
import {TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {experimentInfo, experimentOutput, experimentsView, selectExperimentInfoData, selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentInfo, ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {experimentSectionsEnum} from '../../../features/experiments/shared/experiments.const';
import {IExperimentSettings} from './common-experiment-output.reducer';
import {get} from 'lodash/fp';
import {TaskStatusEnum} from '../../../business-logic/model/tasks/taskStatusEnum';
import {IExecutionForm} from '../../../features/experiments/shared/experiment-execution.model';
import {ExperimentsViewModesEnum} from '../shared/common-experiments.const';
import {ICommonExperimentInfoState} from './common-experiment-info.reducer';
import {IHyperParamsForm} from '../shared/experiment-hyper-params.model';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {IExperimentModelInfo} from '../shared/common-experiment-model.model';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';

export const selectExperimentsList = createSelector(experimentsView, (state): ITableExperiment[] => state.experiments);
export const selectSelectedTableExperiment = createSelector(experimentsView, (state): ITableExperiment => state.selectedExperiment);

export const selectExperimentsTableCols = createSelector(experimentsView, (state): Array<any> => state.tableCols);
export const selectExperimentsUsers = createSelector(experimentsView, (state): Array<any> => state.users);
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

export const selectExperimentLog = createSelector(experimentOutput, (state): Array<any> => state.experimentLog);
export const selectExperimentInfoPlots = createSelector(experimentOutput, (state) => state.metricsPlotsCharts);
export const selectExperimentInfoHistograms = createSelector(experimentOutput, (state) => state.metricsHistogramCharts);
export const selectExperimentMetricsSearchTerm = createSelector(experimentOutput, (state) => state.searchTerm);
export const selectHyperParamsVariants = createSelector(experimentsView, (state): Array<any> => state.hyperParams);

export const selectExperimentUserKnowledge = createSelector(experimentInfo,
  (state): Map<experimentSectionsEnum, boolean> => state.userKnowledge);

export const selectLogFilter = createSelector(experimentOutput, (state) => state.logFilter);
export const selectLogScrollID = createSelector(experimentOutput, (state) => state.logScrollID);

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
  (info: IExperimentInfo): IHyperParamsForm => get('hyperParams', info));

