import { Injectable } from '@angular/core';
import {DagManagerService, DagModelItem} from '@ngneat/dag';

@Injectable({
  providedIn: 'root'
})
export class DagManagerUnsortedService<T extends DagModelItem> extends DagManagerService<T> {

  convertArrayToDagModel(itemsArray: Array<T>): Array<Array<T>> {
    const result = [];
    const levels = {};

    const modify = (data, pid = 0, level = 0) =>
      data
        .filter(({ parentIds, stepId }) => {
          if (levels[level] && levels[level].includes(stepId)) {
            return false;
          }
          return parentIds.includes(pid);
        })
        .forEach((e) => {
          if (!levels[level]) {
            levels[level] = [];
          }
          levels[level].push(e.stepId);

          if (this.findInDoubleArray(e.stepId, result) === -1) {
            if (!result[level]) {
              result[level] = [e];
            } else {
              result[level].push(e);
            }
          }

          modify(data, e.stepId, level + 1);
        });

    modify(itemsArray);
    return result;
  }
}
