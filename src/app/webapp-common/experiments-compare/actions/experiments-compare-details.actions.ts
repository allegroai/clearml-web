import {createAction, props} from '@ngrx/store';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';

export const resetState = createAction('[experiment compare details] RESET_STATE');
export const setExperiments = createAction('[experiment compare details] SET_EXPERIMENTS', props<{experiments: IExperimentDetail[]}>());
export const experimentListUpdated = createAction('[experiment compare details] EXPERIMENT_LIST_UPDATED', props<{ids: string[]}>());
