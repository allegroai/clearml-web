import {
  ISmCol,
  TABLE_SORT_ORDER,
  ColHeaderTypeEnum, ColHeaderFilterTypeEnum
} from '../ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';
import {MetricValueType} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';

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
        return `${key}:${val.matchMode ? val.matchMode + ':' : ''}${val.value.join('+')}`;
      }).join(',');
  }
};

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
  const [col, values] = filter.split(/:(.+)/);
  // if (parts.length === 3) {
  //   mode = parts[1];
  //   parts[1] = parts[2];
  // }
  return {col, filterMatchMode: mode, value: values?.split('+').map(x => x === '' ? null : x)};
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
    .concat(metricsCols ? metricsCols.filter(col => !hiddenCols[col.id]) : [])
    .sort((a, b) => sortCol(a.id, b.id, colsOrder))
    .map((col) => {
      if (col.metric_hash) {
        const headerParts = col.header.trim().split(' > ');
        const variant = headerParts[1]?.replace(` ${getValueTypeName(col.valueType)}`, '');
        return `m.${col.metric_hash}.${col.variant_hash}.${col.valueType}.${headerParts[0]}.${variant}`;
      }
      else {
        return col.id;
      }
    });
};

export const decodeColumns = (columns: string[]): [string[], MetricColumn[], string[], string[]] => {
  const cols = [] as string[];
  const metrics = [] as MetricColumn[];
  const params = [] as string[];
  const allIds = [] as string[];

  columns.forEach(col => {
    if (col.startsWith('m.')) {
      const colParts = col.split('.');
      const  [, metricHash, variantHash, valueType, metric, ...variant] = colParts;
      metrics.push({
        metricHash,
        variantHash,
        valueType: valueType as MetricValueType,
        metric,
        variant: variant.join('.')
      });
      allIds.push(`last_metrics.${colParts[1]}.${colParts[2]}.${colParts[3]}`);
    }
      else if (col.startsWith('hyperparams.')) {
        // const colParts = col.split('.');
        // const param = colParts[1] + (colParts[2] ? `.${colParts[2]}` : '');
        params.push(col);
        allIds.push(col);
    }
    else {
      cols.push(col);
      allIds.push(col);
    }
  });
  return [cols, metrics, params, allIds];
};


export const decodeHyperParam = (param: string): { name: string; section: string } => {
  const split = param.replace('hyperparams.', '').split('.');
  return {
    name: split[1],
    section: split[0]
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
    metric_hash: column.metricHash,
    variant_hash: column.variantHash,
    valueType: column.valueType,
    projectId: projectId,
    style: {width: '115px'},
});

