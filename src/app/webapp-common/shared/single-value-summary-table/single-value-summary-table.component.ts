import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {EventsGetTaskSingleValueMetricsResponseValues} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {download} from '../utils/download';
import {NgForOf, NgIf} from '@angular/common';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';

@Component({
  selector: 'sm-single-value-summary-table',
  templateUrl: './single-value-summary-table.component.html',
  styleUrls: ['./single-value-summary-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class SingleValueSummaryTableComponent {
  @Input() data: Array<EventsGetTaskSingleValueMetricsResponseValues>;
  @Input() experimentName;
  @Input() darkTheme: boolean;
  @Output() createEmbedCode = new EventEmitter<{xaxis: ScalarKeyEnum; domRect: any}>();
  public hover: boolean;
  constructor() { }

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

  createEmbedCodeClicked($event: MouseEvent) {
    this.createEmbedCode.emit({xaxis: null, domRect: {x: $event.clientX, y: $event.clientY}});
  }
}
