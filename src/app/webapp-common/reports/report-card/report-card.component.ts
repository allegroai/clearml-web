import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IReport} from '../reports.consts';

@Component({
  selector: 'sm-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss']
})
export class ReportCardComponent implements OnInit {

  public isExample: boolean;
  private _report: IReport;
  @Input() projectsNames: string[];

  @Input() set report(data: IReport) {
    this._report = data;
    this.isExample = !['All Experiments'].includes(data.name) && (!data.company || ! data.company['id']);
  };
  get report() {
    return this._report;
  }

  @Input() allTags: string[];

  @Input() hideMenu = false;
  @Input() isArchive = false;
  @Output() cardClicked = new EventEmitter<IReport>();
  @Output() nameChanged = new EventEmitter();
  @Output() delete = new EventEmitter ();
  @Output() removeTag = new EventEmitter<string>();
  @Output() addTag = new EventEmitter<string>();
  @Output() archive = new EventEmitter<boolean>();
  @Output() moveTo = new EventEmitter<string>();
  @Output() share = new EventEmitter();


  constructor() { }

  ngOnInit(): void {
  }

}
