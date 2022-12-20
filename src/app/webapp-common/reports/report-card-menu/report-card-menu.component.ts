import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ICONS} from '@common/constants';
import {IReport} from '../reports.consts';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector: 'sm-report-card-menu',
  templateUrl: './report-card-menu.component.html',
  styleUrls: ['./report-card-menu.component.scss']
})
export class ReportCardMenuComponent {
  readonly icons = ICONS;
  private _report: IReport;
  public isExample: boolean;

  @Input() set report(report: IReport) {
    this._report = report;
    this.isExample = isReadOnly(report);
  }

  get report() {
    return this._report;
  }
  @Input() allTags: string[];
  @Input() isArchived: boolean;
  @Output() addTag = new EventEmitter<string>();
  @Output() rename = new EventEmitter();
  @Output() archive = new EventEmitter<boolean>();
  @Output() delete = new EventEmitter();
  @Output() moveTo = new EventEmitter();
  @Output() share = new EventEmitter();
}
