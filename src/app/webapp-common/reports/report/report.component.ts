import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {
  archiveReport, deleteReport,
  getReport,
  getReportsTags,
  moveReport,
  publishReport,
  restoreReport,
  setReport,
  updateReport
} from '@common/reports/reports.actions';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Observable, Subscription, take} from 'rxjs';
import {selectReport, selectReportsTags} from '@common/reports/reports.reducer';
import {ReportStatusEnum} from '~/business-logic/model/reports/reportStatusEnum';
import {isExample} from '@common/shared/utils/shared-utils';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {addMessage} from '@common/core/actions/layout.actions';
import {ICONS, MESSAGES_SEVERITY} from '@common/constants';
import {IReport} from '@common/reports/reports.consts';
import {MarkdownEditorComponent} from '@common/shared/components/markdown-editor/markdown-editor.component';
import {BreakpointObserver} from '@angular/cdk/layout';
import {ActivatedRoute, Router } from '@angular/router';
import {ClipboardService} from 'ngx-clipboard';

@Component({
  selector: 'sm-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  public icons = ICONS;
  public report: IReport;
  public example: boolean;
  public editDesc: boolean;
  public orgDesc: string;
  public draft: boolean;
  public archived: boolean;
  public reportTags$: Observable<string[]>;
  public smallScreen$: Observable<boolean>;
  public printStyle = {
    table: {border: '1px solid gray'}, th: {border: '1px solid gray'}, td: {border: '1px solid gray'}, details: {border: '1px solid #ccc', margin: '6px 0', padding: '6px'}, iframe: {border: 'none'}
  };
  public widthExpanded: boolean = false;
  public editMode: boolean;
  @ViewChild(MarkdownEditorComponent) mdEditor: MarkdownEditorComponent;

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private _clipboardService: ClipboardService
  ) {
    this.smallScreen$ = breakpointObserver.observe('(max-width: 1200px)')
      .pipe(map(state => state.matches));
    this.reportTags$ = this.store.select(selectReportsTags);

    this.store.dispatch(getReportsTags());

    this.sub.add(
      this.store.select(selectRouterParams)
        .pipe(
          map(params => params?.reportId),
          filter(id => !!id),
          distinctUntilChanged()
        )
        .subscribe(id => this.store.dispatch(getReport({id})))
    );
  }

  ngOnInit(): void {
    this.sub.add(
      this.store.select(selectReport)
        .pipe(filter(report => !!report))
        .subscribe(report => {
          this.report = report;
          this.example = isExample(report);
          this.archived = report?.system_tags.includes('archived');
          this.router.navigate(['.'], {relativeTo: this.route, queryParams: {...(this.archived && {archive: this.archived})}});
          this.draft = this.report.status !== ReportStatusEnum.Published;
          this.cdr.detectChanges();
        })
    );
  }

  save(report: string) {
    this.store.dispatch(updateReport({id: this.report.id, changes: {report}}));
    Array.from(window.frames).forEach( frame => frame.postMessage('renderPlot', '*'));
  }

  openTagMenu(event: MouseEvent, tagMenu, tagMenuContent) {
    if (!tagMenu) {
      return;
    }
    tagMenu.position = {x: event.clientX, y: event.clientY};
    window.setTimeout(() => {
      tagMenu.openMenu();
      tagMenuContent.focus();
    });
  }

  addTag(tag: string) {
    const tags = [...this.report.tags, tag];
    tags.sort();
    this.store.dispatch(updateReport({id: this.report.id, changes: {tags}, refresh: true}));
  }

  removeTag(tag: string) {
    this.store.dispatch(updateReport({
      id: this.report.id,
      changes: {tags: this.report.tags.filter(t => t !== tag)},
      refresh: true
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(setReport({report: null}));
  }

  saveDesc(comment: string) {
    this.store.dispatch(updateReport({id: this.report.id, changes: {comment}}));
    this.editDesc = false;
    this.orgDesc = null;
  }

  publish() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'PUBLISH REPORT',
        body: 'After publishing the report it can no longer be edited',
        yes: 'Publish',
        no: 'Cancel',
        iconClass: 'al-icon al-ico-publish'
      }
    }).afterClosed().subscribe(accept =>
      accept && this.store.dispatch(publishReport({id: this.report.id}))
    );
  }

  archive() {
    if (this.archived) {
      this.store.dispatch(restoreReport({report: this.report}));
    } else {
      this.store.dispatch(archiveReport({report: this.report}));
    }
  }

  share() {
    this._clipboardService.copyResponse$
      .pipe(take(1))
      .subscribe(() => this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report link copied to clipboard'))
      );
    this._clipboardService.copy(window.location.href);
  }

  moveToProject() {
    this.store.dispatch(moveReport({report: this.report}));
  }

  editReportDesc(descElement) {
    const end = descElement.value.length;
    this.orgDesc = this.report.comment;
    this.editDesc = true;
    setTimeout(() => {
      descElement.setSelectionRange(end, end);
      descElement.focus();
    }, 100);
  }

  editModeChanged() {
    this.widthExpanded = this.mdEditor.isExpand;
    this.editMode = this.mdEditor.editMode;
    setTimeout(() => Array.from(window.frames).forEach( frame => frame.postMessage('resizePlot', '*')), 500);
  }

  copyMarkdown() {
    this._clipboardService.copyResponse$
      .pipe(take(1))
      .subscribe(() => this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'Report markdown copied to clipboard'))
      );
    this._clipboardService.copy(this.mdEditor.data);
  }

  deleteReport() {
    this.store.dispatch(deleteReport({report: this.report}));
  }
}
