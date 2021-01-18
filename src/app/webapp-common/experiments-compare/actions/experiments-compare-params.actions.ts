import {createAction, props} from '@ngrx/store';
import {ExperimentParams} from '../shared/experiments-compare-details.model';

export const resetState = createAction('[experiment compare params] RESET_STATE');
export const setExperiments = createAction('[experiment compare params] SET_EXPERIMENTS', props<{experiments: ExperimentParams[]}>());
export const experimentListUpdated = createAction('[experiment compare params] EXPERIMENT_LIST_UPDATED', props<{ids: string[]}>());
