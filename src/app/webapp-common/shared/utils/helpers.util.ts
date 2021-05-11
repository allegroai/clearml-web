import { isNil, isUndefined } from 'lodash/fp';

export function hasValue(value): boolean {
  return !isUndefined(value) && !isNil(value);
}

export function getValueOrDefault<T, F>(value: T, fallbackValue?: F): T | F {
  return hasValue(value) ? value : fallbackValue;
}
