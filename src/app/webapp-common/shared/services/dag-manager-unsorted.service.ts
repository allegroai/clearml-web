import { Injectable } from '@angular/core';
import { DagManagerService, DagModelItem } from '@ngneat/dag';
import { maxInArray } from '@common/shared/utils/helpers.util';

@Injectable({
  providedIn: 'root'
})
export class DagManagerUnsortedService<T extends DagModelItem> extends DagManagerService<T> {

  override convertArrayToDagModel(itemsArray: T[]): T[][] {
    const result: Array<Array<T>> = [];
    const nodeLevels = new Map<number, number>();
    const nodeChildren = new Map<number, number[]>();

    // Initialize nodeChildren
    itemsArray.forEach(item => {
      item.parentIds.forEach(pid => {
        if (!nodeChildren.has(pid)) {
          nodeChildren.set(pid, []);
        }
        nodeChildren.get(pid).push(item.stepId);
      });
    });

    // Function to assign levels
    const assignLevels = (item, currentLevel) => {
      const existingLevel = nodeLevels.get(item.stepId);
      if (existingLevel === undefined || existingLevel < currentLevel) {
        nodeLevels.set(item.stepId, currentLevel);
        const parents = itemsArray.filter(i => item.parentIds.includes(i.stepId));
        parents.forEach(parent => {
          assignLevels(parent, currentLevel + 1);
        });
      }
    };

    // Start from leaf nodes and work upwards
    itemsArray.forEach(item => {
      if (!nodeChildren.has(item.stepId)) {
        assignLevels(item, 0);
      }
    });

    // Sort nodes by level and position them
    const maxLevel = maxInArray(Array.from(nodeLevels.values()));
    itemsArray.forEach(item => {
      const level = maxLevel - nodeLevels.get(item.stepId);
      if (!result[level]) {
        result[level] = [];
      }
      result[level].push(item);
    });

    return result;
  }
}
