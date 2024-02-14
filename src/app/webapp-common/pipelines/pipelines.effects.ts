import {Injectable} from '@angular/core';
import {Actions, /* concatLatestFrom, */ createEffect, ofType} from '@ngrx/effects';
import {/* Action, */ Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, filter, map, mergeMap, switchMap, /* tap */} from 'rxjs/operators';
import {activeLoader, /* addMessage, */ deactivateLoader, setServerError} from '../core/actions/layout.actions';
import {requestFailed} from '../core/actions/http.actions';
import {
  createPipeline, createPipelineStep, getAllExperiments, setExperimentsResults
} from './pipelines.actions';
// import {ApiReportsService} from '~/business-logic/api-services/reports.service';
/* import {IReport, PAGE_SIZE} from './reports.consts';
import {
  selectArchiveView,
  selectNestedReports,
  selectReport,
  selectReportsOrderBy,
  selectReportsQueryString,
  selectReportsScrollId,
  selectReportsSortOrder
} from '@common/reports/reports.reducer';
import {ReportsGetAllExResponse} from '~/business-logic/model/reports/reportsGetAllExResponse';
import {Report} from '~/business-logic/model/reports/report';
import {ReportsUpdateResponse} from '~/business-logic/model/reports/reportsUpdateResponse';
import {ReportsMoveResponse} from '~/business-logic/model/reports/reportsMoveResponse';
import {
  selectHideExamples,
  selectMainPageTagsFilter,
  selectMainPageTagsFilterMatchMode,
  selectSelectedProjectId
} from '../core/reducers/projects.reducer';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';

import {escapeRegex} from '../shared/utils/escape-regex';
import {MESSAGES_SEVERITY} from '../constants'; */
import {MatDialog} from '@angular/material/dialog';
import {selectCurrentUser} from '../core/reducers/users-reducer';
/* import {
  ChangeProjectDialogComponent
} from '@common/experiments/shared/components/change-project-dialog/change-project-dialog.component';
import {ReportsMoveRequest} from '~/business-logic/model/reports/reportsMoveRequest';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';
 */
// import {ReportsCreateResponse} from '~/business-logic/model/reports/reportsCreateResponse';
// import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {HttpClient} from '@angular/common/http';
import { PipelinesCreateResponse } from '~/business-logic/model/pipelines/pipelinesCreateResponse';
import { ApiPipelinesService } from '~/business-logic/api-services/pipelines.service';
import { PipelinesCreateStepsResponse } from '~/business-logic/model/pipelines/pipelinesCreateStepsResponse';
import { ApiTasksService } from '~/business-logic/api-services/tasks.service';
/* import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {setMainPageTagsFilter} from '@common/core/actions/projects.actions';
import {cleanTag} from '@common/shared/utils/helpers.util';
import {excludedKey, getTagsFilters} from '@common/shared/utils/tableParamEncode'; */

@Injectable()
export class PipelinesEffects {

  constructor(
    private actions: Actions,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private pipelinesApiService: ApiPipelinesService,
    private experimentsApiService: ApiTasksService,
    private http: HttpClient,
    private matDialog: MatDialog,
    // public projectsApi: ApiProjectsService,
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(/* getReports, getReport, */ createPipeline, createPipelineStep, getAllExperiments/*  updateReport, restoreReport, archiveReport */),
    filter(action => !action['refresh']),
    map(action => activeLoader(action.type))
  ));

  createPipeline$ = createEffect(() => this.actions.pipe(
    ofType(createPipeline),
    switchMap((action) => this.pipelinesApiService.pipelinesCreate(action.pipelinesCreateRequest)
      .pipe(mergeMap((res: PipelinesCreateResponse) => {
        this.router.navigate(['pipelines', res.id, 'edit']);
        return [deactivateLoader(createPipeline.type)];
      }),
      catchError(err => {
        // this.router.navigate(['pipelines', 'b2c6686fb12e4649a954991ca7c24518', 'edit']);
        return [
          requestFailed(err),
          setServerError(err, null, 'failed to create a new pipeline'),
          deactivateLoader(createPipeline.type),
        ]
      })))
  ));


  createPipelineStep$ = createEffect(() => this.actions.pipe(
    ofType(createPipelineStep),
    switchMap((action) => this.pipelinesApiService.pipelinesCreateStep(action.pipelinesCreateStepRequest)
      .pipe(mergeMap((res: PipelinesCreateStepsResponse) => {
        // eslint-disable-next-line no-console
        console.log(res)
        // this.router.navigate(['pipelines', res.id, 'edit']);
        return [deactivateLoader(createPipeline.type)];
      }),
      catchError(err => {
        return [
          requestFailed(err),
          setServerError(err, null, 'failed to create a new pipeline step'),
          deactivateLoader(createPipelineStep.type),
        ]
      })))
  ));



  

  getAllExperiments$ = createEffect(() => this.actions.pipe(
    ofType(getAllExperiments),
    switchMap((action) => this.experimentsApiService.tasksGetAllEx({
      _any_: {
        pattern: action.query ? action.query : '',
        fields: ['name', 'id']
      },
      size: 20,
      // user: this.store.select(selectCurrentUser)?.id,
      only_fields:  ['name', 'created', 'status', 'type', 'user.name', 'id', 'company'],
      // order_by: orderBy,
      // type: [excludedKey, 'annotation_manual', excludedKey, 'annotation', excludedKey, 'dataset_import'],
      // system_tags: ['-archived', '-pipeline', '-dataset'],
      search_hidden: false,
      /* eslint-enable @typescript-eslint/naming-convention */
    }).pipe(
      mergeMap(res => [setExperimentsResults({
        experiments: res.tasks,
      }), deactivateLoader(getAllExperiments.type)]),
      catchError(error => [deactivateLoader(getAllExperiments.type), requestFailed(error)])))
  ));

  // activeLoader = createEffect(() => this.actions.pipe(
  //   ofType(updateProject, getAllProjectsPageProjects),
  //   map(action => activeLoader(action.type))
  // ));

  // updateProject = createEffect(() => this.actions.pipe(
  //   ofType(updateProject),
  //   mergeMap(action => this.projectsApi.projectsUpdate({project: action.id, ...action.changes})
  //     .pipe(
  //       mergeMap((res: ProjectsUpdateResponse) => [
  //         deactivateLoader(action.type),
  //         updateProjectSuccess({id: action.id, changes: res.fields})
  //       ]),
  //       catchError(error => [deactivateLoader(action.type), requestFailed(error),
  //         setServerError(error, undefined, error?.error?.meta?.result_subcode === 800 ?
  //           'Name should be 3 characters long' : error?.error?.meta?.result_subcode === 801 ? 'Name' +
  //             ' already' +
  //             ' exists in this project' : undefined)])
  //     )
  //   )
  // ));

  // getAllProjects = createEffect(() => this.actions.pipe(
  //   ofType(getAllProjectsPageProjects),
  //   concatLatestFrom(() => [
  //     this.store.select(selectRouterParams).pipe(map(params => params?.projectId)),
  //     this.store.select(selectSelectedProjectId),
  //     this.store.select(selectSelectedProject),
  //   ]),
  //   switchMap(([action, routerProjectId, projectId, selectedProject]) =>
  //     (selectedProject || !projectId && !routerProjectId ? of(selectedProject) : this.projectsApi.projectsGetAllEx({
  //       id: routerProjectId || projectId,
  //       // eslint-disable-next-line @typescript-eslint/naming-convention
  //       only_fields: ['name']
  //     }).pipe(map(res => res.projects[0])))
  //       .pipe(
  //         concatLatestFrom(() => [
  //           this.store.select(selectProjectsOrderBy),
  //           this.store.select(selectProjectsSortOrder),
  //           this.store.select(selectProjectsSearchQuery),
  //           this.store.select(selectProjectsScrollId),
  //           this.store.select(selectCurrentUser),
  //           this.store.select(selectShowOnlyUserWork),
  //           this.store.select(selectShowHidden),
  //           this.store.select(selectHideExamples),
  //           this.store.select(selectMainPageTagsFilter),
  //           this.store.select(selectMainPageTagsFilterMatchMode),
  //         ]),

  //         switchMap(([currentProject,
  //                      orderBy, sortOrder, searchQuery, scrollId, user, showOnlyUserWork, showHidden, hideExamples,
  //                      mainPageTagsFilter, mainPageTagsFilterMatchMode]
  //           ) => {
  //             const selectedProjectId = routerProjectId || projectId; // In rare cases where router not updated yet with
  //             const selectedProjectName = selectSelectedProjectId && selectedProjectId !== '*' ? currentProject?.name : null;
  //             const selectedProjectBasename = selectedProjectName?.split('/').at(-1);
  //             // current project id
  //             const projectsView = this.route.snapshot.firstChild.routeConfig.path === 'projects';
  //             const nested = this.route.snapshot.firstChild?.firstChild?.firstChild?.routeConfig?.path === 'projects';
  //             const datasets = isDatasets(this.route.snapshot);
  //             const pipelines = isPipelines(this.route.snapshot);
  //             const reports = isReports(this.route.snapshot);
  //             let statsFilter;
  //             /* eslint-disable @typescript-eslint/naming-convention */
  //             if (!nested) {
  //               if (pipelines) {
  //                 statsFilter = {system_tags: ['pipeline'], type: [TaskTypeEnum.Controller]};
  //               } else if (datasets) {
  //                 statsFilter = {system_tags: ['dataset'], type: [TaskTypeEnum.DataProcessing]};
  //               }
  //             }
  //             if (projectsView && !showHidden) {
  //               statsFilter = {system_tags: ['-pipeline', '-dataset', '-Annotation', '-report']};
  //             }
  //             return forkJoin([
  //               // projects list
  //               this.projectsApi.projectsGetAllEx({
  //                 ...(!nested && mainPageTagsFilter?.length > 0 && {
  //                   filters: {
  //                     tags: getTagsFilters(mainPageTagsFilterMatchMode === 'AND', mainPageTagsFilter),
  //                   }
  //                 }),
  //                 ...(nested && mainPageTagsFilter?.length > 0 && {
  //                   children_tags_filter: getTagsFilters(mainPageTagsFilterMatchMode === 'AND', mainPageTagsFilter)
  //                 }),
  //                 stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
  //                 include_stats: true,
  //                 shallow_search: !searchQuery?.query,
  //                 ...(((projectsView || nested) && !searchQuery?.query) && {permission_roots_only: true}),
  //                 ...((projectsView && selectedProjectId && selectedProjectId !== '*') && {parent: [selectedProjectId]}),
  //                 scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
  //                 size: pageSize,
  //                 ...(showOnlyUserWork && {active_users: [user?.id]}),
  //                 ...((showHidden) && {search_hidden: true}),
  //                 ...(hideExamples && {allow_public: false}),
  //                 order_by: ['featured', sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
  //                 only_fields: ['name', 'company', 'user', 'created', 'default_output_destination', 'basename', 'system_tags']
  //                   .concat(pipelines || datasets ? ['tags', 'last_update'] : []),
  //                 ...(searchQuery?.query && {
  //                   _any_: {
  //                     pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
  //                     fields: ['id', 'basename', 'description']
  //                   }
  //                 }),
  //                 ...(!projectsView && getFeatureProjectRequest(this.route.snapshot, nested, searchQuery, selectedProjectName, selectedProjectId)),
  //               }),
  //               // Getting [current project] stats from server
  //               ((nested || projectsView) && selectedProjectId && selectedProjectId !== '*' && !scrollId && !searchQuery?.query) ?
  //                 this.projectsApi.projectsGetAllEx({
  //                   ...(!datasets && !pipelines && !reports && {id: selectedProjectId}),
  //                   ...(datasets && {
  //                     name: `^${escapeRegex(selectedProjectName)}/\\.datasets$`,
  //                     search_hidden: true,
  //                     children_type: 'dataset'
  //                   }),
  //                   ...(pipelines && {
  //                     name: `^${escapeRegex(selectedProjectName)}/\\.pipelines$`,
  //                     search_hidden: true,
  //                     children_type: 'pipeline'
  //                   }),
  //                   ...(reports && {
  //                     name: `^${escapeRegex(selectedProjectName)}/\\.reports$`,
  //                     search_hidden: true,
  //                     children_type: 'report'
  //                   }),
  //                   ...((!showHidden && projectsView) && {include_stats_filter: statsFilter}),
  //                   ...((pipelines && !nested) && {
  //                     include_stats_filter: {
  //                       system_tags: ['pipeline'],
  //                       type: ['controller']
  //                     }
  //                   }),
  //                   ...(datasets && !nested ? {include_dataset_stats: true} : {include_stats: true}),
  //                   stats_with_children: reports || pipelines || datasets,
  //                   stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
  //                   ...(showHidden && {search_hidden: true}),
  //                   check_own_contents: true, // in order to check if project is empty
  //                   ...(showOnlyUserWork && {active_users: [user.id]}),
  //                   only_fields: ['name', 'company', 'user', 'created', 'default_output_destination'],
  //                   ...(!projectsView && getSelfFeatureProjectRequest(this.route.snapshot)),
  //                 }) : nested && reports && selectedProjectId === '*' && !scrollId && !searchQuery?.query ?
  //                   // nested reports virtual card
  //                   this.projectsApi.projectsGetAllEx({
  //                     name: '^\\.reports$',
  //                     search_hidden: true,
  //                     children_type: 'report',
  //                     stats_with_children: false,
  //                     stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
  //                     include_stats: true,
  //                     check_own_contents: true, // in order to check if project is empty
  //                     ...(showOnlyUserWork && {active_users: [user.id]}),
  //                     only_fields: ['id', 'company'],
  //                     ...(mainPageTagsFilter?.length > 0 && {
  //                         children_tags_filter: getTagsFilters(mainPageTagsFilterMatchMode === 'AND', mainPageTagsFilter)
  //                     }),

  //                     /* eslint-enable @typescript-eslint/naming-convention */
  //                   }) :
  //                   of(null),
  //             ]).pipe(
  //               debounceTime(0),
  //               map(([projectsRes, currentProjectRes]: [ProjectsGetAllExResponse, ProjectsGetAllExResponse]) => ({
  //                   newScrollId: projectsRes.scroll_id,
  //                   projects: currentProjectRes !== null && currentProjectRes.projects.length !== 0 &&
  //                   this.isNotEmptyExampleProject(currentProjectRes.projects[0]) ?
  //                     /* eslint-disable @typescript-eslint/naming-convention */
  //                     [(currentProjectRes?.projects?.length === 0 ?
  //                       {
  //                         isRoot: true,
  //                         sub_projects: null,
  //                         name: `[${selectedProjectName}]`,
  //                         basename: `[${selectedProjectBasename}]`
  //                       } :
  //                       {
  //                         ...currentProjectRes.projects[0],
  //                         id: selectedProjectId,
  //                         isRoot: true,
  //                         // eslint-disable-next-line @typescript-eslint/naming-convention
  //                         sub_projects: null,
  //                         name: !selectedProjectName && currentProjectRes.projects[0].stats ? '[Root]' : `[${selectedProjectName}]`,
  //                         basename: !selectedProjectName && currentProjectRes.projects[0].stats ? '[Root]' : `[${selectedProjectBasename}]`
  //                       }),
  //                       ...projectsRes.projects
  //                       /* eslint-enable @typescript-eslint/naming-convention */
  //                     ] :
  //                     projectsRes.projects
  //                 }
  //               )),
  //               mergeMap(({newScrollId, projects}) => [
  //                 addToProjectsList({
  //                   projects, reset: !scrollId
  //                 }),
  //                 deactivateLoader(action.type),
  //                 setCurrentScrollId({scrollId: newScrollId}),
  //                 setNoMoreProjects({payload: projects.length < pageSize})]),
  //               catchError(error => [deactivateLoader(action.type), requestFailed(error)])
  //             );
  //           }
  //         )
  //       )
  //   ),
  // ));

  // updateProjectStats = createEffect(() => this.actions.pipe(
  //   ofType(setFilterByUser),
  //   concatLatestFrom(() => [
  //     this.store.select(selectSelectedProject),
  //     this.store.select(selectCurrentUser),
  //     this.store.select(selectShowHidden)
  //   ]),
  //   filter(([, project]) => !!project),
  //   switchMap(([action, project, user, showHidden]) => this.projectsApi.projectsGetAllEx({
  //     /* eslint-disable @typescript-eslint/naming-convention */
  //     id: [project.id],
  //     include_stats: true,
  //     ...(showHidden && {search_hidden: true}),
  //     ...(!showHidden && {include_stats_filter: {system_tags: ['-pipeline', '-dataset']}}),
  //     ...(action.showOnlyUserWork && {active_users: [user.id]}),
  //     /* eslint-enable @typescript-eslint/naming-convention */
  //   })),
  //   switchMap(({projects}) => [setSelectedProjectStats({project: projects[0]})]),
  //   catchError(error => [requestFailed(error)])
  // ));

  // setProjectsOrderBy = createEffect(() => this.actions.pipe(
  //   ofType(setProjectsOrderBy),
  //   mergeMap(() => [getAllProjectsPageProjects()])
  // ));

  // showExamplePipeline = createEffect(() => this.actions.pipe(
  //   ofType(showExamplePipelines),
  //   map(() => localStorage.setItem('_saved_pipeline_state_', JSON.stringify(
  //     {...JSON.parse(localStorage.getItem('_saved_pipeline_state_')), showPipelineExamples: true}
  //   )))
  // ), {dispatch: false});

  // showExampleDataset = createEffect(() => this.actions.pipe(
  //   ofType(showExampleDatasets),
  //   map(() => localStorage.setItem('_saved_pipeline_state_', JSON.stringify(
  //     {...JSON.parse(localStorage.getItem('_saved_pipeline_state_')), showDatasetExamples: true})))
  // ), {dispatch: false});

  // setProjectsSearchQuery = createEffect(() => this.actions.pipe(
  //   ofType(setProjectsSearchQuery),
  //   filter(action => !action.skipGetAll),
  //   mergeMap(() => [getAllProjectsPageProjects()])
  // ));

  // private isNotEmptyExampleProject(project: Project) {
  //   return !(isExample(project) && project.own_models === 0 && project.own_tasks === 0);
  // }





  // getReports = createEffect(() => this.actions.pipe(
  //   ofType(getReports, setReportsOrderBy),
  //   concatLatestFrom(() => [
  //     this.store.select(selectReportsScrollId),
  //     this.store.select(selectArchiveView),
  //     this.store.select(selectReportsOrderBy),
  //     this.store.select(selectReportsSortOrder),
  //     this.store.select(selectShowOnlyUserWork),
  //     this.store.select(selectMainPageTagsFilter),
  //     this.store.select(selectMainPageTagsFilterMatchMode),
  //     this.store.select(selectCurrentUser),
  //     this.store.select(selectReportsQueryString),
  //     this.store.select(selectHideExamples),
  //     this.store.select(selectRouterParams).pipe(map(params => params?.projectId)),
  //   ]),
  //   switchMap(([action, scroll, archive, orderBy, sortOrder, showOnlyUserWork, mainPageTagsFilter, mainPageTagsFilterMatchMode, user, searchQuery, hideExamples, projectId]) =>
  //     this.pipelinesApiService.reportsGetAllEx({
  //       /* eslint-disable @typescript-eslint/naming-convention */
  //       only_fields: ['name', 'comment', 'company', 'tags', 'report', 'project.name', 'user.name', 'status', 'last_update', 'system_tags'] as (keyof Report)[],
  //       size: PAGE_SIZE,
  //       project: projectId === '*' ? null : projectId,
  //       scroll_id: action['loadMore'] ? scroll : null,
  //       ...(hideExamples && {allow_public: false}),
  //       system_tags: [archive ? '__$and' : excludedKey, 'archived'],
  //       ...(showOnlyUserWork && {user: [user.id]}),
  //       order_by: [sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
  //       ...(mainPageTagsFilter?.length > 0 && {
  //         filters: {
  //           tags: getTagsFilters(!!mainPageTagsFilterMatchMode, mainPageTagsFilter),
  //         }
  //       }),
  //       ...(searchQuery?.query && {
  //         _any_: {
  //           pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
  //           fields: ['id', 'name', 'tags', 'project', 'comment', 'report']
  //         }
  //       })
  //       /* eslint-enable @typescript-eslint/naming-convention */
  //     })
  //       .pipe(
  //         mergeMap((res: ReportsGetAllExResponse) => [
  //           deactivateLoader(action.type),
  //           action['loadMore'] ?
  //             addReports({
  //               reports: res.tasks as IReport[],
  //               scroll: res.scroll_id,
  //               noMoreReports: res.tasks.length < PAGE_SIZE
  //             }) :
  //             setReports({
  //               reports: res.tasks as IReport[],
  //               scroll: res.scroll_id,
  //               noMoreReports: res.tasks.length < PAGE_SIZE
  //             })
  //         ]),
  //         catchError(err => [
  //           requestFailed(err),
  //           setServerError(err, null, 'failed to fetch reports'),
  //           deactivateLoader(action.type),
  //         ])
  //       )
  //   )
  // ));

  // getReportsTags = createEffect(() => this.actions.pipe(
  //   ofType(getReportsTags),
  //   switchMap(() => this.pipelinesApiService.reportsGetTags({})),
  //   concatLatestFrom(() => this.store.select(selectMainPageTagsFilter)),
  //   mergeMap(([res, fTags]) => [
  //     setReportsTags({tags: res.tags}),
  //     ...(fTags?.some(fTag => !res.tags.includes(cleanTag(fTag))) ?
  //       [
  //         setMainPageTagsFilter({
  //           tags: fTags.filter(fTag => res.tags.includes(cleanTag(fTag))),
  //           feature: 'reports'
  //         })
  //       ] : []),
  //   ]),
  //   catchError(err => [
  //     requestFailed(err),
  //     setServerError(err, null, 'failed to fetch reports'),
  //   ])
  // ));

  // getReport = createEffect(() => this.actions.pipe(
  //   ofType(getReport),
  //   switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
  //     filter(ready => ready),
  //     map(() => action))),
  //   switchMap(action => this.pipelinesApiService.reportsGetAllEx({
  //     id: [action.id],
  //     // eslint-disable-next-line @typescript-eslint/naming-convention
  //     only_fields: ['name', 'status', 'company.id', 'user.id', 'comment', 'report', 'tags', 'system_tags', 'report_assets', 'project.name']
  //   })),
  //   tap(res => {
  //     if (res.tasks.length === 0) {
  //       this.router.navigateByUrl('/404');
  //     }
  //   }),
  //   mergeMap((res: ReportsGetAllExResponse) => [
  //     setReport({report: res.tasks[0] as IReport}),
  //     deactivateLoader(getReport.type),
  //   ]),
  //   catchError(err => [
  //     deactivateLoader(getReport.type),
  //     requestFailed(err),
  //     setServerError(err, null, 'failed to fetch report'),
  //   ])
  // ));

  // updateReport = createEffect(() => this.actions.pipe(
  //   ofType(updateReport),
  //   switchMap(action => this.pipelinesApiService.reportsUpdate({
  //       task: action.id,
  //       ...action.changes
  //     }).pipe(
  //       mergeMap((res: ReportsUpdateResponse) => [
  //         setReportChanges({id: action.id, changes: {...res.fields, ...action.changes}}),
  //         deactivateLoader(action.type),
  //       ]),
  //       catchError(err => [
  //         deactivateLoader(action.type),
  //         requestFailed(err),
  //         setServerError(err, null, 'failed to update report'),
  //       ])
  //     )
  //   )
  // ));

  // moveReport = createEffect(() => this.actions.pipe(
  //   ofType(moveReport),
  //   switchMap(action =>
  //     this.matDialog.open(ChangeProjectDialogComponent, {
  //       data: {
  //         currentProjects: action.report.project?.id ?? action.report.project,
  //         defaultProject: action.report.project,
  //         reference: action.report.name,
  //         type: 'report'
  //       }
  //     }).afterClosed()
  //       // eslint-disable-next-line @typescript-eslint/naming-convention
  //       .pipe(
  //         filter(project => !!project),
  //         // eslint-disable-next-line @typescript-eslint/naming-convention
  //         map(project => ({task: action.report.id, project: project.id, project_name: project.name}))
  //       )
  //   ),
  //   switchMap((moveRequest: ReportsMoveRequest) => this.pipelinesApiService.reportsMove(moveRequest)
  //     .pipe(
  //       concatLatestFrom(() => [
  //         this.store.select(selectSelectedProjectId),
  //         this.store.select(selectNestedReports)
  //       ]),
  //       mergeMap(([res, projectId, nested]: [ReportsMoveResponse, string, boolean]) => [
  //         setReportChanges({
  //           id: moveRequest.task,
  //           filterOut: projectId && (projectId !== '*' || nested) && projectId !== moveRequest.project,
  //           changes: {
  //             project: (moveRequest.project ?
  //               {id: res.project_id, name: moveRequest.project_name} :
  //               {id: res.project_id, name: moveRequest.project_name ?? 'Root project'})
  //           }
  //         }),
  //         deactivateLoader(moveReport.type),
  //         addMessage(MESSAGES_SEVERITY.SUCCESS, `Report moved successfully to ${moveRequest.project_name ?? 'Projects root'}`),
  //         navigateToProjectAfterMove({projectId: res.project_id})
  //       ]),
  //       catchError(err => [
  //         deactivateLoader(moveReport.type),
  //         requestFailed(err),
  //         setServerError(err, null, 'failed to move report'),
  //       ])
  //     )
  //   )
  // ));

  // navigateToProjectAfterMove = createEffect(() => this.actions.pipe(
  //   ofType(navigateToProjectAfterMove),
  //   concatLatestFrom(() => this.store.select(selectReport)),
  //   filter(([, report]) => !!report?.id),
  //   tap(([action, report]) => {
  //     this.router.navigateByUrl(`reports/${action.projectId}/${report.id}`);
  //   }),
  // ), {dispatch: false});

  // publishReport = createEffect(() => this.actions.pipe(
  //   ofType(publishReport),
  //   switchMap(action => this.pipelinesApiService.reportsPublish({task: action.id})
  //     .pipe(
  //       mergeMap((res: ReportsUpdateResponse) => [
  //         setReportChanges({id: action.id, changes: res.fields}),
  //         deactivateLoader(action.type),
  //       ]),
  //       catchError(err => [
  //         deactivateLoader(action.type),
  //         requestFailed(err),
  //         setServerError(err, null, 'failed to publish report'),
  //       ])
  //     )
  //   )
  // ));

  // archiveReport = createEffect(() => this.actions.pipe(
  //   ofType(archiveReport),
  //   switchMap((action) => this.pipelinesApiService.reportsArchive({task: action.report.id})
  //     .pipe(
  //       mergeMap(() => {
  //         const undoActions = [
  //           {
  //             name: 'Undo', actions: [
  //               restoreReport({report: action.report, skipUndo: true})
  //             ]
  //           }
  //         ];
  //         return [
  //           deactivateLoader(action.type),
  //           getReports(),
  //           ...(!action.skipUndo ?
  //             [addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report archived successfully', [null, ...undoActions
  //             ].filter(a => a))] : []),
  //           // eslint-disable-next-line @typescript-eslint/naming-convention
  //           setReportChanges({
  //             id: action.report.id,
  //             // eslint-disable-next-line @typescript-eslint/naming-convention
  //             changes: {system_tags: (action.report.system_tags || []).concat('archived')}
  //           })
  //         ];
  //       }),
  //       catchError(error => [
  //         requestFailed(error),
  //         deactivateLoader(action.type),
  //         setServerError(error, null, 'Failed To Archive reports')
  //       ])
  //     )
  //   )
  // ));


  // restoreReport = createEffect(() => this.actions.pipe(
  //   ofType(restoreReport),
  //   switchMap((action) => this.pipelinesApiService.reportsUnarchive({task: action.report.id})
  //     .pipe(
  //       mergeMap(() => {
  //         const undoActions = [
  //           {
  //             name: 'Undo', actions: [
  //               archiveReport({report: action.report, skipUndo: true}),
  //             ]
  //           }
  //         ];
  //         const actions: Action[] = [
  //           deactivateLoader(action.type),
  //           getReports(),
  //           ...(!action.skipUndo ?
  //             [(addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report restored successfully', [null, ...undoActions].filter(a => a)))] : []),
  //           setReportChanges({
  //             id: action.report.id,
  //             // eslint-disable-next-line @typescript-eslint/naming-convention
  //             changes: {system_tags: (action.report.system_tags || []).filter(tag => tag !== 'archived')}
  //           })
  //         ];
  //         return actions;
  //       }),
  //       catchError(error => [
  //         requestFailed(error),
  //         deactivateLoader(action.type),
  //         setServerError(error, null, 'Failed To restore reports')
  //       ])
  //     )
  //   )
  // ));

  // deleteReport = createEffect(() => this.actions.pipe(
  //   ofType(deleteReport),
  //   switchMap(action => this.matDialog.open(
  //     ConfirmDialogComponent,
  //     {
  //       data: {
  //         title: 'DELETE',
  //         body: '<p class="text-center">Permanently Delete Report</p>',
  //         yes: 'Delete',
  //         no: 'Cancel',
  //         iconClass: 'al-ico-trash',
  //         width: 430
  //       }
  //     }).afterClosed().pipe(
  //     filter(confirm => !!confirm),
  //     switchMap(() => this.pipelinesApiService.reportsDelete({task: action.report.id})),
  //     mergeMap(() => {
  //       this.router.navigate(['reports'], {queryParamsHandling: 'merge'});
  //       return [
  //         removeReport({id: action.report.id}),
  //         getReports(),
  //         deactivateLoader(action.type),
  //         addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report deleted successfully')
  //       ];
  //     }),
  //     catchError(error => [
  //       requestFailed(error),
  //       deactivateLoader(action.type),
  //       setServerError(error, null, 'Failed To delete reports')
  //     ])
  //   )),
  // ));

  // deleteResource = createEffect(() => this.actions.pipe(
  //   ofType(deleteResource),
  //   switchMap(action => this.http.delete(action.resource)
  //     .pipe(
  //       catchError(() => [addMessage(MESSAGES_SEVERITY.ERROR, 'failed to delete resource')]),
  //       concatLatestFrom(() => this.store.select(selectReport)),
  //       mergeMap(([, report]) => [updateReport({
  //         id: report.id,
  //         changes: {
  //           // eslint-disable-next-line @typescript-eslint/naming-convention
  //           report_assets: report.report_assets?.filter(r => r !== action.resource),
  //         }
  //       })])
  //     )
  //   )
  // ));
}
