import {ActionReducerMap, createSelector} from '@ngrx/store';
import {experimentsViewReducer, IExperimentsViewState} from './experiments-view.reducer';
import {experimentInfoReducer, IExperimentInfoState} from './experiment-info.reducer';
import {experimentOutputReducer} from './experiment-output.reducer';
import {IExperimentInfo, ISelectedExperiment} from '../shared/experiment-info.model';
import {TaskStatusEnum} from '../../../business-logic/model/tasks/taskStatusEnum';
import {MetricVariantResult} from '../../../business-logic/model/projects/metricVariantResult';
import {isExample} from '../../../webapp-common/shared/utils/shared-utils';
import {EXPERIMENTS_STORE_KEY} from '../../../webapp-common/experiments/shared/common-experiments.const';
import {CommonExperimentOutputState} from '../../../webapp-common/experiments/reducers/common-experiment-output.reducer';

export const experimentsReducers: ActionReducerMap<any, any> = {
  view  : experimentsViewReducer,
  info  : experimentInfoReducer,
  output: experimentOutputReducer,
};

/**
 * The createFeatureSelector function selects a piece of state from the root of the state object.
 * This is used for selecting feature states that are loaded eagerly or lazily.
 */
export function experiments(state) {
  return state[EXPERIMENTS_STORE_KEY];
}

// view selectors.
export const experimentsView              = createSelector(experiments, (state): IExperimentsViewState => state ? state.view : {});
export const selectExperimentsMetricsCols = createSelector(experimentsView, (state): Array<any> => state.metricsCols);
export const selectMetricVariants         = createSelector(experimentsView, (state): Array<MetricVariantResult> => state.metricVariants);
export const selectMetricsLoading         = createSelector(experimentsView, (state): boolean => state.metricsLoading);


// info selectors
export const experimentInfo           = createSelector(experiments, (state): IExperimentInfoState => state ? state.info : {});
export const selectSelectedExperiment = createSelector(experimentInfo, (state): ISelectedExperiment => state.selectedExperiment);
export const selectExperimentInfoData = createSelector(experimentInfo, (state): IExperimentInfo => state.infoData);
export const selectShowExtraDataSpinner = createSelector(experimentInfo, state => state.showExtraDataSpinner);



// output selectors
export const experimentOutput = createSelector(experiments, (state): CommonExperimentOutputState => state ? state.output : {});

export const selectIsExperimentEditable = createSelector(selectSelectedExperiment,
  (experiment: ISelectedExperiment): boolean => experiment && experiment.status === TaskStatusEnum.Created && !isExample(experiment));

export const selectExperimentInfoDataFreeze = createSelector(experimentInfo, (state): IExperimentInfo => state.infoDataFreeze);

export const selectExperimentInfoErrors   = createSelector(experimentInfo, (state): IExperimentInfoState['errors'] => state.errors);
export const selectExperimentFormValidity = createSelector(selectExperimentInfoData, selectExperimentInfoErrors,
  (infoData, errors): boolean => {
    if (!infoData || !errors) {
      return true;
    }
    const error = Object.keys(infoData).find(key => errors[key]);

    return !error;
  });
