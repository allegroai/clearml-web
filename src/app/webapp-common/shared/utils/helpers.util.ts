import { isNil, isUndefined } from 'lodash-es';
import {excludedKey} from '@common/shared/utils/tableParamEncode';

export function hasValue(value): boolean {
  return !isUndefined(value) && !isNil(value);
}

export function getValueOrDefault<T, F>(value: T, fallbackValue?: F): T | F {
  return hasValue(value) ? value : fallbackValue;
}
export const cleanTag = (tag) => tag.replace(excludedKey, '');
