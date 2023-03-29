export const isReadOnly = item => {
  if (item?.id === '*') {
    return false;
  }
  return (!item?.company?.id) || (!!item?.readOnly);
};
