import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {FormsTrackBy, trackById} from '../../../utils/forms-track-by';

@Component({
  selector: 'sm-simple-table-2',
  templateUrl: './simple-table.component.html',
  styleUrls: ['./simple-table.component.scss'],
})
export class SimpleTableComponent2 extends FormsTrackBy {

  public open = [];
  public trackById = trackById;

  get formData() {
    return this.rowsData;
  }
  @Input() rowsConfig: Array<{ collapsible: boolean }> = [];
  @Input() rowsData: Array<any>;
  @Input() cols: { class: string; header: string; subHeader?: string }[];
  @Input() hideHeaders = false;
  @Input() enableDragAndDrop = false;
  @Input() noDataMessage: string;
  @Output() entryDropped = new EventEmitter<CdkDragDrop<any>>();

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  isRowToggleable(rowIndex) {
    return this.rowsConfig[rowIndex] && this.rowsConfig[rowIndex].collapsible;
  }

  toggleRow(rowIndex) {
    if (this.isRowToggleable(rowIndex)) {
      this.open[rowIndex] = !this.open[rowIndex];
    }
  }

  drop($event: CdkDragDrop<any, any>) {
    this.entryDropped.emit($event);
  }
}
