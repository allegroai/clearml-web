import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, addMessage, deactivateLoader, setServerError} from '../core/actions/layout.actions';
import {requestFailed} from '../core/actions/http.actions';
import {
  addReports,
  archiveReport,
  createReport,
  deleteReport,
  getReport,
  getReports,
  getReportsTags,
  moveReport,
  publishReport,
  removeReport,
  restoreReport,
  setReport,
  setReportChanges,
  setReports,
  setReportsOrderBy,
  setReportsTags,
  updateReport
} from './reports.actions';
import {ApiReportsService} from '~/business-logic/api-services/reports.service';
import {IReport, PAGE_SIZE} from './reports.consts';
import {
  selectArchiveView,
  selectReportsOrderBy,
  selectReportsQueryString,
  selectReportsScrollId,
  selectReportsSortOrder
} from '@common/reports/reports.reducer';
import {ReportsGetAllExResponse} from '~/business-logic/model/reports/reportsGetAllExResponse';
import {Report} from '~/business-logic/model/reports/report';
import {ReportsUpdateResponse} from '~/business-logic/model/reports/reportsUpdateResponse';
import {ReportsMoveResponse} from '~/business-logic/model/reports/reportsMoveResponse';
import {selectHideExamples, selectMainPageTagsFilter, selectMainPageTagsFilterMatchMode} from '../core/reducers/projects.reducer';
import {ReportsGetTagsResponse} from '~/business-logic/model/reports/reportsGetTagsResponse';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';
import {addExcludeFilters} from '../shared/utils/tableParamEncode';
import {escapeRegex} from '../shared/utils/escape-regex';
import {MESSAGES_SEVERITY} from '../constants';
import {MatDialog} from '@angular/material/dialog';
import {
  ChangeProjectDialogComponent
} from '@common/experiments/shared/components/change-project-dialog/change-project-dialog.component';
import {ReportsMoveRequest} from '~/business-logic/model/reports/reportsMoveRequest';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';
import {ReportsCreateResponse} from '~/business-logic/model/reports/reportsCreateResponse';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';

@Injectable()
export class ReportsEffects {

  constructor(
    private actions: Actions,
    private store: Store<any>,
    private route: ActivatedRoute,
    private router: Router,
    private reportsApiService: ApiReportsService,
    private matDialog: MatDialog
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(getReports, getReport, createReport, updateReport, restoreReport, archiveReport),
    filter(action => !action['refresh']),
    map(action => activeLoader(action.type))
  ));

  createReport$ = createEffect(() => this.actions.pipe(
    ofType(createReport),
    switchMap((action) => this.reportsApiService.reportsCreate(action.reportsCreateRequest)),
    mergeMap((res: ReportsCreateResponse) => {
      this.router.navigate(['reports', res.project_id, res.id]);
      return [deactivateLoader(createReport.type)];
    }),
    catchError(err => [
      requestFailed(err),
      setServerError(err, null, 'failed to create a new report'),
      deactivateLoader(createReport.type),
    ])
  ));

  getReports = createEffect(() => this.actions.pipe(
    ofType(getReports, setReportsOrderBy),
    withLatestFrom(
      this.store.select(selectReportsScrollId),
      this.store.select(selectArchiveView),
      this.store.select(selectReportsOrderBy),
      this.store.select(selectReportsSortOrder),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectMainPageTagsFilter),
      this.store.select(selectMainPageTagsFilterMatchMode),
      this.store.select(selectCurrentUser),
      this.store.select(selectReportsQueryString),
      this.store.select(selectHideExamples),
    ),
    switchMap(([action, scroll, archive, orderBy, sortOrder, showOnlyUserWork, mainPageTagsFilter, mainPageTagsFilterMatchMode, user, searchQuery, hideExamples]) =>
      this.reportsApiService.reportsGetAllEx({
        /* eslint-disable @typescript-eslint/naming-convention */
        only_fields: ['name', 'comment', 'company', 'tags', 'report', 'project.name', 'user.name', 'status', 'last_update', 'system_tags'] as (keyof Report)[],
        size: PAGE_SIZE,
        scroll_id: action['loadMore'] ? scroll : null,
        ...(hideExamples && {allow_public: false}),
        system_tags: [archive ? '__$and' : '__$not', 'archived'],
        ...(showOnlyUserWork && {user: [user.id]}),
        order_by: [sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
        ...(mainPageTagsFilter?.length > 0 && {tags: [(mainPageTagsFilterMatchMode ? '__$and' : '__$or'), ...addExcludeFilters(mainPageTagsFilter)]}),
        ...(searchQuery?.query && {
          _any_: {
            pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
            fields: ['id', 'name', 'tags', 'project']
          }
        })
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap((res: ReportsGetAllExResponse) => [
            deactivateLoader(action.type),
            action['loadMore'] ?
              addReports({
                reports: res.tasks as IReport[],
                scroll: res.scroll_id,
                noMoreReports: res.tasks.length < PAGE_SIZE
              }) :
              setReports({
                reports: res.tasks as IReport[],
                scroll: res.scroll_id,
                noMoreReports: res.tasks.length < PAGE_SIZE
              })
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err, null, 'failed to fetch reports'),
            deactivateLoader(action.type),
          ])
        )
    )
  ));

  getReportsTags = createEffect(() => this.actions.pipe(
    ofType(getReportsTags),
    switchMap(() => this.reportsApiService.reportsGetTags({})),
    mergeMap((res: ReportsGetTagsResponse) => [
      setReportsTags({tags: res.tags})
    ]),
    catchError(err => [
      requestFailed(err),
      setServerError(err, null, 'failed to fetch reports'),
    ])
  ));

  getReport = createEffect(() => this.actions.pipe(
    ofType(getReport),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
    switchMap(action => this.reportsApiService.reportsGetAllEx({id: [action.id]})),
    mergeMap((res: ReportsGetAllExResponse) => [
      setReport({report: res.tasks[0] as IReport}),
      deactivateLoader(getReport.type),
    ]),
    catchError(err => [
      deactivateLoader(getReport.type),
      requestFailed(err),
      setServerError(err, null, 'failed to fetch report'),
    ])
  ));

  updateReport = createEffect(() => this.actions.pipe(
    ofType(updateReport),
    switchMap(action => this.reportsApiService.reportsUpdate({
        task: action.id,
        ...action.changes
      }).pipe(
        mergeMap((res: ReportsUpdateResponse) => [
          setReportChanges({id: action.id, changes: {...res.fields, ...action.changes}}),
          deactivateLoader(action.type),
        ]),
        catchError(err => [
          deactivateLoader(action.type),
          requestFailed(err),
          setServerError(err, null, 'failed to update report'),
        ])
      )
    )
  ));

  moveReport = createEffect(() => this.actions.pipe(
    ofType(moveReport),
    switchMap(action =>
      this.matDialog.open(ChangeProjectDialogComponent, {
        data: {
          currentProjects: action.report.project?.id ?? action.report.project,
          defaultProject: action.report.project?.id ?? action.report.project,
          reference: action.report.name,
          type: 'report'
        }
      }).afterClosed()
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .pipe(
          filter(project => !!project),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          map(project => ({task: action.report.id, project: project.id, project_name: project.name}))
        )
    ),
    switchMap((moveRequest: ReportsMoveRequest) => this.reportsApiService.reportsMove(moveRequest).pipe(
        mergeMap((res: ReportsMoveResponse) => [
          setReportChanges({
            id: moveRequest.task,
            changes: {
              project: (moveRequest.project ?
                {id: moveRequest.project, name: moveRequest.project_name} :
                {id: res.project_id, name: moveRequest.project_name})
            }
          }),
          deactivateLoader(moveReport.type),
        ]),
        catchError(err => [
          deactivateLoader(moveReport.type),
          requestFailed(err),
          setServerError(err, null, 'failed to move report'),
        ])
      )
    )
  ));

  publishReport = createEffect(() => this.actions.pipe(
    ofType(publishReport),
    switchMap(action => this.reportsApiService.reportsPublish({task: action.id})
      .pipe(
        mergeMap((res: ReportsUpdateResponse) => [
          setReportChanges({id: action.id, changes: res.fields}),
          deactivateLoader(action.type),
        ]),
        catchError(err => [
          deactivateLoader(action.type),
          requestFailed(err),
          setServerError(err, null, 'failed to publish report'),
        ])
      )
    )
  ));

  archiveReport = createEffect(() => this.actions.pipe(
    ofType(archiveReport),
    switchMap((action) => this.reportsApiService.reportsArchive({task: action.report.id})
      .pipe(
        mergeMap(() => {
          const undoActions = [
            {
              name: 'Undo', actions: [
                restoreReport({report: action.report, skipUndo: true})
              ]
            }
          ];
          return [
            deactivateLoader(action.type),
            ...(!action.skipUndo ?
              [addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report archived successfully', [null, ...undoActions
              ].filter(a => a))] : []),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            setReportChanges({
              id: action.report.id,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              changes: {system_tags: (action.report.system_tags || []).concat('archived')}
            })
          ];
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Failed To Archive reports')
        ])
      )
    )
  ));


  restoreReport = createEffect(() => this.actions.pipe(
    ofType(restoreReport),
    switchMap((action) => this.reportsApiService.reportsUnarchive({task: action.report.id})
      .pipe(
        mergeMap(() => {
          const undoActions = [
            {
              name: 'Undo', actions: [
                archiveReport({report: action.report, skipUndo: true}),
              ]
            }
          ];
          const actions: Action[] = [
            deactivateLoader(action.type),
            ...(!action.skipUndo ?
              [(addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report restored successfully', [null, ...undoActions].filter(a => a)))] : []),
            setReportChanges({
              id: action.report.id,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              changes: {system_tags: (action.report.system_tags || []).filter(tag => tag !== 'archived')}
            })
          ];
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Failed To restore reports')
        ])
      )
    )
  ));

  deleteReport = createEffect(() => this.actions.pipe(
    ofType(deleteReport),
    switchMap(action => this.matDialog.open(
      ConfirmDialogComponent,
      {
        data: {
          title: 'DELETE',
          body: 'Permanently Delete Report',
          yes: 'Delete',
          no: 'Cancel',
          iconClass: 'al-ico-trash',
        }
      }).afterClosed().pipe(
      filter(confirm => !!confirm),
      switchMap(() => this.reportsApiService.reportsDelete({task: action.report.id})),
      mergeMap(() => {
        this.router.navigate(['reports'], {queryParamsHandling: 'merge'});
        return [
          removeReport({id: action.report.id}),
          deactivateLoader(action.type),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report deleted successfully')
        ];
      }),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Failed To delete reports')
      ])
    )),
  ));

}
