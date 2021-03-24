import {createAction, props} from '@ngrx/store';
import {VIEW_PREFIX} from '../../app.constants';

export const dismissSurvey = createAction(VIEW_PREFIX + ' [dismiss survey]');
