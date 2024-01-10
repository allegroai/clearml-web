import {createActionGroup, props, emptyProps} from '@ngrx/store';
import {ExperimentParams} from '../shared/experiments-compare-details.model';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

export const paramsActions = createActionGroup({
    source: 'experiment compare params',
    events: {
        'reset state': emptyProps(),
        'set experiments': props<{experiments: ExperimentParams[]}>(),
        'experiment list updated': props<{ids: string[]; entity: EntityTypeEnum}>(),
        'set view': props<{primary: string; secondary: string}>()
    }
})
