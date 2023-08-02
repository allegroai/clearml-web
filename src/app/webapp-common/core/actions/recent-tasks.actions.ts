import {createAction} from '@ngrx/store';
import {Task} from '~/business-logic/model/tasks/task';

export const setRecentTasks = createAction('[RECENT_TASKS] SET_RECENT_TASKS', (tasks: Task[]) => ({ tasks }));
