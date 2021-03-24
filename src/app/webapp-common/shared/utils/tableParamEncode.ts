import {TableSortOrderEnum, ISmCol} from '../ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';

export interface TableFilter {
  col?: string;
  value?: any;
  filterMatchMode?: string;
}

export interface MetricColumn {
  metricHash: string;
  variantHash: string;
  valueType: string;
  metric: string;
  variant: string;
}

export function getValueTypeName(valueType: string) {
  return valueType.replace('_', '').replace('value', '').toUpperCase();
}

export function encodeOrder(direction: 'asc' | 'desc', field: string): string {
  return `${direction === 'desc' ? '-' : ''}${field}`;
}

export function encodeFilters(filters: { [key: string]: FilterMetadata }) {
  if (filters) {
    return Object.keys(filters)
      .filter((key: string) => filters[key].value?.length)
      .map((key: string) => {
        const val = filters[key] as FilterMetadata;
        return `${key}:${val.matchMode ? val.matchMode + ':' : ''}${val.value.join('+')}`;
      }).join(',');
  }
}

export function decodeOrder(order: string): [string, TableSortOrderEnum] {
  if (order[0] === '-') {
    return [order.slice(1), -1];
  } else {
    return [order, 1];
  }
}

export function decodeFilter(filters: string): TableFilter[] {
  return filters.split(',').map((filter: string) => {
    const parts = filter.split(':');
    const [col, values] = filter.split(/:(.+)/);
    let mode: string;
    // if (parts.length === 3) {
    //   mode = parts[1];
    //   parts[1] = parts[2];
    // }
    return {col, filterMatchMode: mode, value: values?.split('+')};
  });
}

export function sortCol(a, b, colsOrder) {
  const indexOfA = colsOrder.indexOf(a);
  const indexOfB = colsOrder.indexOf(b);
  return ((indexOfA >= 0) ? indexOfA : 99) - ((indexOfB >= 0) ? indexOfB : 99);
}

export function encodeColumns(mainCols: ISmCol[] | any, hiddenCols = {}, metricsCols = [], colsOrder = []): string[] {
  colsOrder.filter(col => !hiddenCols[col]);
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
      if (col.isParam) {
        return `p.${col.header}`;
      } else {
        return col.id;
      }
    });
}

export function decodeColumns(columns: string[]): [string[], MetricColumn[], string[], string[]] {
  const cols = [] as string[];
  const metrics = [] as MetricColumn[];
  const params = [] as string[];
  const allIds = [] as string[];

  columns.forEach(col => {
    if (col.startsWith('m.')) {
      const colParts = col.split('.');
      metrics.push({
        metricHash: colParts[1],
        variantHash: colParts[2],
        valueType: colParts[3],
        metric: colParts[4],
        variant: colParts[5]
      });
      allIds.push(`last_metrics.${colParts[1]}.${colParts[2]}.${colParts[3]}`);
    } else if (col.startsWith('p.')) {
      const colParts = col.split('.');
      const param = colParts[1] + (colParts[2] ? `.${colParts[2]}` : '');
      params.push(param);
      allIds.push(param);
    } else {
      cols.push(col);
      allIds.push(col);
    }
  });
  return [cols, metrics, params, allIds];
}
