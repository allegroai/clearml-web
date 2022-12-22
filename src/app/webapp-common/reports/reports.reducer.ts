import {createReducer, createSelector, on} from '@ngrx/store';
import {
  addReports,
  removeReport,
  resetReports,
  setArchive,
  setReport,
  setReportChanges,
  setReports,
  setReportsOrderBy,
  setReportsSearchQuery,
  setReportsTags
} from './reports.actions';
import {IReport} from './reports.consts';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';

const getCorrectSortingOrder = (currentSortOrder: TableSortOrderEnum, currentOrderField: string, nextOrderField: string) => {
  if (currentOrderField === nextOrderField) {
    return currentSortOrder === TABLE_SORT_ORDER.DESC ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC;
  } else {
    return nextOrderField === 'last_update' ? TABLE_SORT_ORDER.DESC : TABLE_SORT_ORDER.ASC;
  }
};

export const REPORTS_KEY = 'reports';

export interface ReportsState {
  reports: IReport[];
  reportsTags: string[];
  scroll: string;
  report: IReport;
  orderBy: string;
  sortOrder: TableSortOrderEnum;
  archive: boolean;
  noMoreReports: boolean;
  queryString: { query: string; regExp?: boolean };
}

export const reportsInitState: ReportsState = {
  reportsTags: [],
  orderBy: 'last_update',
  sortOrder: TABLE_SORT_ORDER.DESC,
  reports: null,
  scroll: null,
  report: null,
  archive: false,
  noMoreReports: null,
  queryString: null,
};

export const reportsReducer = createReducer(
  reportsInitState,
  on(setReports, (state, action) => ({
      ...state,
      reports: action.reports,
      scroll: action.scroll,
      noMoreReports: action.noMoreReports
    })
  ),
  on(addReports, (state, action) => ({
      ...state,
      reports: [...(action.scroll && state.reports || []), ...action.reports],
      scroll: action.scroll,
      noMoreReports: action.noMoreReports
    })
  ),
  on(setReportsTags, (state, action) => ({
      ...state,
      reportsTags: action.tags
    })
  ),
  on(setReport, (state, action) => ({...state, report: action.report})),
  on(setReportChanges, (state, action) => ({
    ...state,
    report: {...state.report, ...action.changes},
    reports: state.reports?.map(report => report.id !== action.id ? report : {...report, ...action.changes})
  })),
  on(setArchive, (state, action) => ({...state, archive: action.archive, scroll: null, reports: null})),
  on(resetReports, (state) => ({
    ...state,
    reports: reportsInitState.reports,
    scrollId: reportsInitState.scroll,
    noMoreReports: reportsInitState.noMoreReports
  })),
  on(setReportsOrderBy, (state, action) => ({
    ...state,
    orderBy: action.orderBy,
    sortOrder: getCorrectSortingOrder(state.sortOrder, state.orderBy, action.orderBy),
  })),
  on(removeReport, (state, action) => ({...state, reports: state.reports?.filter(report => report.id !== action.id)})),
  on(setReportsSearchQuery, (state, action) => ({
    ...state,
    queryString: (action as ReturnType<typeof setReportsSearchQuery>),
  })),
);

export const selectReportsState = state => state[REPORTS_KEY] as ReportsState;
export const selectReportsTags = createSelector(selectReportsState, state => state.reportsTags);
export const selectReportsScrollId = createSelector(selectReportsState, state => state.scroll);
export const selectReport = createSelector(selectReportsState, state => state?.report ?? null);
export const selectArchiveView = createSelector(selectReportsState, state => state.archive);
export const selectReports = createSelector(selectReportsState, selectArchiveView, (state, isArchiveView) => state.reports ?
  state.reports.filter(report => isArchiveView ? report.system_tags.includes('archived') : !report.system_tags.includes('archived')) : null);
export const selectNoMoreReports = createSelector(selectReportsState, state => state.noMoreReports);
export const selectReportsOrderBy = createSelector(selectReportsState, state => state ? state.orderBy : reportsInitState.orderBy);
export const selectReportsSortOrder = createSelector(selectReportsState, state => state ? state.sortOrder : reportsInitState.sortOrder);
export const selectReportsQueryString = createSelector(selectReportsState, state => state ? state.queryString : reportsInitState.queryString);
