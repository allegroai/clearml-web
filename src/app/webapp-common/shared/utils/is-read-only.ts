import {get} from 'lodash/fp';

export const isReadOnly = item => {
  if (get('id', item) === '*') {
    return false;
  }
  return (!get('company.id', item)) || (!!get('readOnly', item));
};
