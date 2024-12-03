import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {isArray} from 'lodash-es';

export const download = (data: string, exportName: string) => {
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', data);
  downloadAnchorNode.setAttribute('download', exportName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const prepareColsForDownload = (cols: ISmCol[], valuesMap?: {[colId: string]: {key: any; value: any}[]}) =>
  cols.filter(col => col.id !== 'selected' && (col.includeInDownload || !col.hidden))
    .map(col => col.getter && isArray(col.getter) ? col.getter.map(getterKey => ({...col, downloadKey: getterKey})) : col).flat()
    .map(thisCol =>
      ({
        field: thisCol.downloadKey ?? thisCol.getter as string ?? thisCol.id,
        name: (thisCol.downloadKey ? `${thisCol.header}: ${thisCol.downloadKey}` : thisCol.header ),
        ...(!!valuesMap?.[thisCol.downloadKey ?? thisCol.getter as string ?? thisCol.id] && {values: valuesMap[thisCol.downloadKey ?? thisCol.getter as string ?? thisCol.id]})
      })
    );

