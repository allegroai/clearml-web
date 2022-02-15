import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

@Component({
  selector: 'sm-scroll-textarea',
  templateUrl: './scroll-textarea.component.html',
  styleUrls: ['./scroll-textarea.component.scss']})
export class ScrollTextareaComponent {

  lines: string[];
  search: string = '';
  lastSearchIndex = -1;

  @ViewChild('scroll') scroll: CdkVirtualScrollViewport;
  private _formData: string;

  @Input() set formData(data: string) {
    this._formData = data;
    this.lines = data ? data.split('\n').map( line => line.length > 800 ? line.substring(0, 800) + '...' : line) : [];
  }

  get formData() {
    return this._formData;
  }

  @Input() isInDev: boolean = false;
  @Input() editable: boolean;
  @Input() disabled: boolean;
  @Input() showSpinner: boolean;
  @Input() emptyMessage: string = 'No changes logged';
  @Input() minHeight = '250px';
  @Output() freezeForm = new EventEmitter();

  onSearchValueChanged(value: string) {
    if (value != this.search) {
      this.lastSearchIndex = -1;
    }
    this.search = value;
    if (value?.length > 0) {
      const pos = this.lines.slice(this.lastSearchIndex + 1).findIndex(line => line.includes(value));
      if (pos > -1) {
        this.lastSearchIndex = pos + this.lastSearchIndex + 1;
        this.scroll.scrollToIndex(this.lastSearchIndex);
      }
    }
  }
}
