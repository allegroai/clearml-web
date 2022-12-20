import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ReportDialogComponent} from '../report-dialog/report-dialog.component';
import {
  archiveReport,
  createReport, deleteReport,
  getReports,
  getReportsTags,
  moveReport,
  resetReports,
  restoreReport,
  setArchive,
  setReportsOrderBy, setReportsSearchQuery,
  updateReport
} from '../reports.actions';
import {
  selectArchiveView,
  selectNoMoreReports,
  selectReports,
  selectReportsOrderBy, selectReportsQueryString,
  selectReportsSortOrder,
  selectReportsTags
} from '../reports.reducer';
import {combineLatest, Observable, Subscription, take} from 'rxjs';
import {Report} from '~/business-logic/model/reports/report';
import {IReport} from '../reports.consts';
import {addMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../constants';
import {selectMainPageTagsFilter, selectMainPageTagsFilterMatchMode} from '../../core/reducers/projects.reducer';
import {selectShowOnlyUserWork} from '../../core/reducers/users-reducer';
import {selectSearchQuery} from '../../common-search/common-search.reducer';
import {initSearch} from '../../common-search/common-search.actions';
import {debounceTime, filter, tap} from 'rxjs/operators';
import {addProjectTags, setTags} from '@common/core/actions/projects.actions';
import {isEqual} from 'lodash/fp';
import {ClipboardService} from 'ngx-clipboard';

@Component({
  selector: 'sm-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsPageComponent implements OnInit, OnDestroy {
  public reports$: Observable<any>;
  public archive$: Observable<any>;
  public reportsTags$: Observable<string[]>;
  private sub = new Subscription();
  public noMoreReports$: Observable<boolean>;
  public reportsOrderBy$: Observable<string>;
  public reportsSortOrder$: Observable<1 | -1>;
  private searchQuery$: Observable<{ query: string; regExp?: boolean; original?: string }>;

  constructor(
    private store: Store<any>,
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private _clipboardService: ClipboardService
) {
    this.reports$ = this.store.select(selectReports);
    this.reportsTags$ = this.store.select(selectReportsTags).pipe(tap(tags => store.dispatch(setTags({tags}))));
    this.archive$ = this.store.select(selectArchiveView);
    this.noMoreReports$ = this.store.select(selectNoMoreReports);
    this.reportsOrderBy$ = this.store.select(selectReportsOrderBy);
    this.reportsSortOrder$ = this.store.select(selectReportsSortOrder);
    this.searchQuery$ = this.store.select(selectSearchQuery);

    this.store.dispatch(getReportsTags());
  }

  public openCreateReportDialog() {
    this.matDialog.open(ReportDialogComponent).afterClosed().subscribe(report => {
      if (report) {
        this.store.dispatch(createReport({reportsCreateRequest: report}));
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(resetReports());
    this.store.dispatch(setTags({tags: []}));
  }

  ngOnInit(): void {
    this.store.dispatch(initSearch({payload: 'Search for reports'}));

    let prevQueryParams: Params;
    this.sub.add(combineLatest([
        this.store.select(selectMainPageTagsFilter),
        this.store.select(selectMainPageTagsFilterMatchMode),
        this.store.select(selectShowOnlyUserWork),
        this.store.select(selectReportsQueryString),
        this.route.queryParams
          .pipe(
            filter(params => !isEqual(params, prevQueryParams)),
            tap(params => this.store.dispatch(setArchive({archive: params?.archive})))
          )
      ])
        .pipe(debounceTime(0))
        .subscribe(() => {
          this.store.dispatch(getReports());
        })
    );

    this.sub.add(this.searchQuery$.subscribe((searchQ) => {
      this.store.dispatch(setReportsSearchQuery(searchQ));
    }));
  }


  reportSelected(report: Report) {
    this.router.navigate([(report.project as any).id, report.id], {relativeTo: this.route});

  }

  toggleArchive(archive: boolean) {
    this.router.navigate(['.'], {relativeTo: this.route, queryParams: {...(archive && {archive})}});
  }

  reportCardUpdateName($event: { name: string; report: IReport }) {
    this.store.dispatch(updateReport({id: $event.report.id, changes: {name: $event.name}}));
  }

  moveTo(report: IReport) {
    this.store.dispatch(moveReport({report}));
  }

  share(report: IReport) {
    this._clipboardService.copyResponse$
      .pipe(take(1))
      .subscribe(() => this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS,
        'Resource embed code copied to clipboard.You can paste in your Reports.'))
      );
    this._clipboardService.copy(`${window.location.href}/${report.project.id}/${report.id}`);
  }

  addTag($event: { report: IReport; tag: string }) {
    const tags = [...$event.report.tags, $event.tag];
    tags.sort();
    this.store.dispatch(updateReport({id: $event.report.id, changes: {tags}}));
    this.store.dispatch(addProjectTags({tags: [$event.tag], systemTags: []}));
  }

  removeTag($event: { report: IReport; tag: string }) {
    this.store.dispatch(updateReport({
      id: $event.report.id,
      changes: {tags: $event.report.tags.filter(tag => tag !== $event.tag)}
    }));
  }

  loadMore() {
    this.store.dispatch(getReports(true));
  }

  moveToArchive($event: { report: IReport; archive: boolean }) {
    if ($event.archive) {
      this.store.dispatch(archiveReport({report: $event.report, skipUndo: false}));
    } else {
      this.store.dispatch(restoreReport({report: $event.report, skipUndo: false}));
    }
  }

  orderByChanged(sortByFieldName: string) {
    this.store.dispatch(setReportsOrderBy({orderBy: sortByFieldName}));
  }

  delete(report: IReport) {
    this.store.dispatch(deleteReport({report}));
  }
}
