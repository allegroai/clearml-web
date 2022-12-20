import {ActionReducerMap, createSelector} from '@ngrx/store';
import {experimentsViewReducer, ExperimentsViewState, initialState as viewInitialState} from './experiments-view.reducer';
import {experimentInfoReducer, ExperimentInfoState, initialState as infoInitialState} from './experiment-info.reducer';
import {experimentOutputReducer, ExperimentOutputState, initialState as outputInitialState} from './experiment-output.reducer';
import {IExperimentInfo} from '../shared/experiment-info.model';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {selectSelectedModel} from '@common/models/reducers';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {isSharedAndNotOwner} from '@common/shared/utils/is-shared-and-not-owner';

export interface ExperimentState {
  view: ExperimentsViewState;
  info: ExperimentInfoState;
  output: ExperimentOutputState;
}

export const experimentsReducers: ActionReducerMap<ExperimentState, any> = {
  view: experimentsViewReducer,
  info: experimentInfoReducer,
  output: experimentOutputReducer,
};

export const experiments = state => state.experiments ?? {} as ExperimentState;

// view selectors.
export const experimentsView = createSelector(experiments, state => (state?.view ?? viewInitialState) as ExperimentsViewState);
export const selectExperimentsMetricsCols = createSelector(experimentsView, state => state.metricsCols);
export const selectMetricVariants = createSelector(experimentsView, state => state.metricVariants);
export const selectMetricsLoading = createSelector(experimentsView, state => state.metricsLoading);


// info selectors
export const experimentInfo = createSelector(experiments, state => (state?.info ?? infoInitialState) as ExperimentInfoState);
export const selectSelectedExperiment = createSelector(experimentInfo, state => state?.selectedExperiment);
export const selectExperimentInfoData = createSelector(experimentInfo, state => state.infoData);
export const selectShowExtraDataSpinner = createSelector(experimentInfo, state => state.showExtraDataSpinner);


// output selectors
export const experimentOutput = createSelector(experiments, state => (state.output ?? outputInitialState) as ExperimentOutputState);
export const selectIsExperimentEditable = createSelector(selectSelectedExperiment, selectCurrentUser,
  (experiment, user): boolean => experiment && experiment.status === TaskStatusEnum.Created && !isReadOnly(experiment) && !isSharedAndNotOwner(experiment, user.company));
export const selectIsSharedAndNotOwner = createSelector(selectSelectedExperiment, selectSelectedModel, selectCurrentUser,
  (experiment, model, user): boolean => {
  const item = experiment || model;
    return item && isSharedAndNotOwner(item, user.company);
  }
);
export const selectExperimentInfoDataFreeze = createSelector(experimentInfo, (state): IExperimentInfo => state.infoDataFreeze);

export const selectExperimentInfoErrors = createSelector(experimentInfo, (state): ExperimentInfoState['errors'] => state.errors);
export const selectExperimentFormValidity = createSelector(selectExperimentInfoData, selectExperimentInfoErrors,
  (infoData, errors): boolean => {
    if (!infoData || !errors) {
      return true;
    }
    const error = Object.keys(infoData).find(key => errors[key]);

    return !error;
  });
