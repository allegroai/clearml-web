import {Component, effect, EventEmitter, input, Output, output} from '@angular/core';
import {trackById} from '@common/shared/utils/forms-track-by';
import {pageSize} from '@common/projects/common-projects.consts';
import {IReport} from '../reports.consts';
import {Report} from '~/business-logic/model/reports/report';

@Component({
  selector: 'sm-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent {
  constructor() {
    effect(() => {
      if (this.reports()) {
        this.loading = false;
      }
    });
  }
  pageSize = pageSize;
  reports = input<IReport[]>([]);
  hideMenu = input(false);
  noMoreReports = input(false);
  allTags = input<string[]>([]);
  archive = input(false);
  projectId = input<string>();
  reportSelected = output<IReport>();
  loadMore = output();
  reportCardUpdateMetadata = output<{
        report: IReport;
        readOnly: boolean;
    }>();
  reportCardUpdateName = output<{
        name: string;
        report: IReport;
    }>();
  @Output() newReport = new EventEmitter<string>();
  addTag = output<{
        report: IReport;
        tag: string;
    }>();
  moveToArchive = output<{
        report: IReport;
        archive: boolean;
    }>();
  removeTag = output<{
        report: IReport;
        tag: string;
    }>();
  moveTo = output<IReport>();
  delete = output<IReport>();
  share = output<IReport>();

  trackByFn = trackById;
  loading: boolean;

  loadMoreAction() {
    this.loading = true;
    this.loadMore.emit();
  }
}
