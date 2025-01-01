import {createAction, props} from '@ngrx/store';
import {IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ModelDetail} from '@common/experiments-compare/shared/experiments-compare-details.model';

export const resetState = createAction('[experiment compare details] RESET_STATE');
export const setExperiments = createAction('[experiment compare details] SET_EXPERIMENTS', props<{experiments: IExperimentDetail[]}>());
export const setModels = createAction('[experiment compare details] SET_MODELS', props<{models: ModelDetail[]}>());
export const experimentListUpdated = createAction('[experiment compare details] EXPERIMENT_LIST_UPDATED', props<{ids: string[]; entity: EntityTypeEnum}>());
