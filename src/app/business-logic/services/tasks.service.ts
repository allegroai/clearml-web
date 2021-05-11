import {Injectable} from '@angular/core';
import {TASK_TYPES} from '../../app.constants';
import {TAGS, TASKS_STATUS} from '../../webapp-common/tasks/tasks.constants';
import {Task} from '../model/tasks/task';
import {get} from 'lodash/fp';
import {DEFAULT_QUEUE_TAG} from '../variables';

@Injectable()
export class BlTasksService {

  constructor() {
  }

  private previouslyUsedQueue;

  getDefaultQueue(queues) {
    return queues.find(queue => get('id', this.previouslyUsedQueue) === queue.id) || queues.find(queue => this.isDefaultQueue(queue));
  }

  setPreviouslyUsedQueue(queue) {
    this.previouslyUsedQueue = queue;
  }

  isDefaultQueue(queue) {
    return queue.system_tags && queue.system_tags.includes(DEFAULT_QUEUE_TAG);
  }

  canEnqueue(task: Task): boolean {
    return !!(task && (TASKS_STATUS.CREATED === task.status || TASKS_STATUS.STOPPED === task.status) && task.type !== TASK_TYPES.MANUAL_ANNOTATION);
  }

  canDequeue(task: Task): boolean {
    return !!(task && TASKS_STATUS.QUEUED === task.status);
  }

  addHiddenTag(taskTags: Task['system_tags']): Task['system_tags'] {
    if (taskTags) {
      if (taskTags.includes('archived')) {
        return taskTags;
      } else {
        return taskTags.concat(['archived']);
      }
    } else {
      return ['archived'];
    }
  }

  removeHiddenTag(taskTags: Task['system_tags']): Task['system_tags'] {
    if (taskTags.includes('archived')) {
      return taskTags.filter(tag => tag !== 'archived');
    }
    return taskTags;
  }

  updateAnnotatorIndexTag(taskTags: Task['system_tags'], annotatorIndex: number): Task['system_tags'] {
    const indexOf = taskTags.findIndex(tag => tag.startsWith(TAGS.ANNOTATOR_INDEX_TAG_PREFIX));
    if (indexOf === -1) {
      taskTags.push(`${TAGS.ANNOTATOR_INDEX_TAG_PREFIX}:${annotatorIndex || '1'}`);
    } else {
      taskTags[indexOf] = `${TAGS.ANNOTATOR_INDEX_TAG_PREFIX}:${annotatorIndex}`;
    }
    return taskTags;
  }

  updateAnnotatedNumberTag(taskTags: Task['system_tags']): Task['system_tags'] {
    const indexOf = taskTags.findIndex(tag => tag.startsWith(TAGS.ANNOTATED_NUMBER_TAG_PREFIX));
    if (indexOf === -1) {
      taskTags.push(`${TAGS.ANNOTATED_NUMBER_TAG_PREFIX}:1`);
    } else {
      taskTags[indexOf] = `${TAGS.ANNOTATED_NUMBER_TAG_PREFIX}:${this.getTaskAnnotorValue(taskTags[indexOf]) + 1}`;
    }
    return taskTags;
  }

  getAnnotatorIndexTag(taskTags: Task['system_tags']): number {
    const foundTag = taskTags.find(tag => tag.startsWith(TAGS.ANNOTATOR_INDEX_TAG_PREFIX));
    return foundTag ? this.getTaskAnnotorValue(foundTag) : 0;
  }

  getAnnotatedNumberTag(taskTags: Task['system_tags']): number {
    const foundTag = taskTags.find(tag => tag.startsWith(TAGS.ANNOTATED_NUMBER_TAG_PREFIX));
    return foundTag ? this.getTaskAnnotorValue(foundTag) : 0;
  }

  getTaskAnnotorValue(annotatorTag: string): number {
    return parseInt(annotatorTag.split(':')[1], 10);
  }
}
