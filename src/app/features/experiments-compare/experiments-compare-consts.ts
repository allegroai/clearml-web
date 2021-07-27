import {COMPARE_DETAILS_ONLY_FIELDS_BASE} from '../../webapp-common/experiments-compare/experiments-compare.constants';

export const getCompareDetailsOnlyFields = param => COMPARE_DETAILS_ONLY_FIELDS_BASE;

export const COMPARE_PARAMS_ONLY_FIELDS = [
  'id',
  'name',
  'type',
  'status',
  'last_update',
  'project.name',
  'tags',
  'published',
  'last_iteration',
  'hyperparams'
];
