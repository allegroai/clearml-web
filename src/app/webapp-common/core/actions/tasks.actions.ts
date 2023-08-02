import {createAction} from '@ngrx/store';

export const setTaskInListAndInSelectedTask = createAction('[TASKS_PREFIX] OPTIMISTIC', (taskId: string, field: string, value) => ({
  task   : taskId,
  [field]: value
}));
