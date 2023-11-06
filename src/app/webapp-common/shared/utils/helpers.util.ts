import {isNil, isUndefined} from 'lodash-es';
import {excludedKey} from '@common/shared/utils/tableParamEncode';

export function hasValue(value): boolean {
  return !isUndefined(value) && !isNil(value);
}

export function getValueOrDefault<T, F>(value: T, fallbackValue?: F): T | F {
  return hasValue(value) ? value : fallbackValue;
}

export const cleanTag = (tag) => tag === null ? null : tag.replace(excludedKey, '');

// 2 helper functions to overcome Chrome issue with min/max calculation of large arrays
// https://stackoverflow.com/questions/42623071/maximum-call-stack-size-exceeded-with-math-min-and-math-max
export const maxInArray = (arr: number[]) => {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
};
export const minInArray = (arr: number[]) => {
  let len = arr.length;
  let min = Infinity;

  while (len--) {
    min = arr[len] < min ? arr[len] : min;
  }
  return min;
};
