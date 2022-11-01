import {
  ColHeaderFilterTypeEnum,
  ColHeaderTypeEnum,
  ISmCol,
  TABLE_SORT_ORDER
} from '../ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';
import {MetricValueType} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {hasValue} from './helpers.util';

export interface TableFilter {
  col?: string;
  value?: any;
  filterMatchMode?: string;
}

export interface MetricColumn {
  metricHash: string;
  variantHash: string;
  valueType: MetricValueType;
  metric: string;
  variant: string;
}

export const getValueTypeName = (valueType: string) => valueType.replace('_', '').replace('value', '').toUpperCase();

export const encodeOrder = (orders: SortMeta[]): string[] => orders.map(order => `${order.order === TABLE_SORT_ORDER.DESC ? '-' : ''}${order.field}`);

export const encodeFilters = (filters: { [key: string]: FilterMetadata }) => {
  if (filters) {
    return Object.keys(filters)
      .filter((key: string) => filters[key].value?.length)
      .map((key: string) => {
        const val = filters[key] as FilterMetadata;
        return `${key}:${val.matchMode ? val.matchMode + ':' : ''}${val.value.join('+$+')}`;
      }).join(',');
  }
};
export const excludedKey = '__$not';
export const uniqueFilterValueAndExcluded = (arr1 = [], arr2 = []) => Array.from(new Set(arr1.concat((arr2).map(key => key ? key.replace(/^__\$not/, '') : key))));
export const addExcludeFilters = (arr1: string[]) =>
  arr1.reduce((returnArray, currentFilter) => {
    if (currentFilter?.startsWith(excludedKey)) {
      return [...returnArray, excludedKey, currentFilter.substring(excludedKey.length)];
    }
    return [...returnArray, currentFilter];

  }, []);

export const decodeOrder = (orders: string[]): SortMeta[] => {
  if (typeof orders === 'string') {
    orders = [orders];
  }
  return orders.map(order => {
    if (order[0] === '-') {
      return {field: order.slice(1), order: -1} as SortMeta;
    } else {
      return {field: order, order: 1} as SortMeta;
    }
  });
};

export const decodeFilter = (filters: string): TableFilter[] => filters.split(',').map((filter: string) => {
  let mode: string;
  const index = filter.indexOf(':AND');
  if (index > -1) {
    mode = 'AND';
    filter = filter.replace(':AND', '');
  }
  const [col, values] = filter.split(/:(.*)/);
  // if (parts.length === 3) {
  //   mode = parts[1];
  //   parts[1] = parts[2];
  // }
  return {col, filterMatchMode: mode, value: values?.split('+$+').map(x => x === '' ? null : x)};
});

export const sortCol = (a, b, colsOrder) => {
  const indexOfA = colsOrder.indexOf(a);
  const indexOfB = colsOrder.indexOf(b);
  return ((indexOfA >= 0) ? indexOfA : 99) - ((indexOfB >= 0) ? indexOfB : 99);
};

export const encodeColumns = (mainCols: ISmCol[] | any, hiddenCols = {}, metricsCols = [], colsOrder = []): string[] => {
  colsOrder = colsOrder.filter(col => !hiddenCols[col]);
  return mainCols
    .filter(col => !hiddenCols[col.id])
    .concat(metricsCols ? metricsCols : [])
    .sort((a, b) => sortCol(a.id, b.id, colsOrder))
    .map((col) => {
      if (col.metric_hash) {
        const headerParts = col.header.trim().split(' > ');
        const variant = headerParts[1]?.replace(` ${getValueTypeName(col.valueType)}`, '');
        return `m.${col.metric_hash}.${col.variant_hash}.${col.valueType}.${headerParts[0]}.${variant}`;
      }
      if (col.type === 'metadata') {
        return `meta.${col.key}`;
      } else if (col.type === 'hdmd') {
        return `hdmd.${col.key}`;
      } else {
        return col.id;
      }
    });
};

export const decodeColumns = (columns: string[], tableCols: ISmCol[]): [string[], MetricColumn[], string[], string[], string[]] => {
  const cols = [] as string[];
  const metrics = [] as MetricColumn[];
  const params = [] as string[];
  const allIds = [] as string[];
  const metadataCols = [] as string[];

  columns.forEach(col => {
    if (col.startsWith('m.')) {
      const colParts = col.split('.');
      const [, metricHash, variantHash, valueType, metric, ...variant] = colParts;
      metrics.push({
        metricHash,
        variantHash,
        valueType: valueType as MetricValueType,
        metric,
        variant: variant.join('.')
      });
      allIds.push(`last_metrics.${colParts[1]}.${colParts[2]}.${colParts[3]}`);
    } else if (col.startsWith('hyperparams.') && !tableCols.find(tableCol => tableCol.id === col)) {
      // const colParts = col.split('.');
      // const param = colParts[1] + (colParts[2] ? `.${colParts[2]}` : '');
      params.push(col);
      allIds.push(col);
    } else if (col.startsWith('meta.') && !tableCols.find(tableCol => tableCol.id === col)) {
      const colParts = col.split('.');
      metadataCols.push(colParts[1]);
      allIds.push(colParts[1]);
    } else if (col.startsWith('hdmd.') && !tableCols.find(tableCol => tableCol.id === col)) {
      const colPart = col.replace('hdmd.', '');
      metadataCols.push(colPart);
      allIds.push(colPart);
    } else {
      cols.push(col);
      allIds.push(col);
    }
  });
  return [cols, metrics, params, metadataCols, allIds];
};


export const decodeHyperParam = (param: string): { name: string; section: string } => {
  const [section, ...rest] = param.replace('hyperparams.', '').split('.');
  return {
    name: rest.slice(0, -1).join('.'),
    section
  };
};

export const createMetricColumn = (column: MetricColumn, projectId: string): ISmCol => ({
  id: `last_metrics.${column.metricHash}.${column.variantHash}.${column.valueType}`,
  headerType: ColHeaderTypeEnum.sortFilter,
  sortable: true,
  filterable: true,
  filterType: ColHeaderFilterTypeEnum.durationNumeric,
  header: `${column.metric} > ${column.variant} ${getValueTypeName(column.valueType)}`,
  hidden: false,
  /* eslint-disable @typescript-eslint/naming-convention */
  metric_hash: column.metricHash,
  variant_hash: column.variantHash,
  /* eslint-enable @typescript-eslint/naming-convention */
  valueType: column.valueType,
  projectId,
  style: {width: '115px'},
});

export const createMetadataCol = (key, projectId): ISmCol => ({
  id: `metadata.${key}.value`,
  getter: `metadata.${key}.value`,
  key,
  headerType: ColHeaderTypeEnum.sortFilter,
  sortable: true,
  filterable: true,
  header: key,
  style: {width: '240px'},
  projectId,
  type: 'metadata'
});

export const createHyperDatasetMetadataCol = (key, datasetId): ISmCol => ({
  id: `hdmd.${key}`,
  getter: `meta.${key}`,
  key,
  headerType: ColHeaderTypeEnum.sortFilter,
  sortable: true,
  filterable: false,
  header: key,
  style: {width: '240px'},
  datasetId,
  type: 'hdmd'
});
export const createFiltersFromStore = (_tableFilters: { [key: string]: FilterMetadata }, removeEmptyValues = true) => {
  if (!_tableFilters) {
    return [];
  }
  return Object.keys(_tableFilters).reduce((returnTableFilters, currentFilterName) => {
    const value = _tableFilters?.[currentFilterName]?.value;
    if (removeEmptyValues && (!hasValue(value) || value?.length === 0)) {
      return returnTableFilters;
    }
    returnTableFilters[currentFilterName] = value;
    return returnTableFilters;
  }, {});
};
