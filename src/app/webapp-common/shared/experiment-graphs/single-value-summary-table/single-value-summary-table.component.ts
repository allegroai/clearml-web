import {Component, Input, OnInit} from '@angular/core';
import { EventsGetTaskSingleValueMetricsResponseValues } from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {download} from '../../utils/download';

@Component({
  selector: 'sm-single-value-summary-table',
  templateUrl: './single-value-summary-table.component.html',
  styleUrls: ['./single-value-summary-table.component.scss']
})
export class SingleValueSummaryTableComponent implements OnInit {
  @Input() data: Array<EventsGetTaskSingleValueMetricsResponseValues>;
  @Input() experimentName;
  public hover: boolean;
  constructor() { }

  ngOnInit(): void {
  }
  public downloadTableAsCSV() {
    const vals = this.data.map(item=>item.value) as number[];
    const headers = this.data.map(item=>item.variant);
    if (vals && headers) {
      let data = headers.join(',') + '\n' + vals.join(',');
      const exportName = `${this.experimentName} summary.csv`;
      data = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
      download(data, exportName);
    }
  }

  setHover(hover: boolean) {
    this.hover = hover;
  }
}
