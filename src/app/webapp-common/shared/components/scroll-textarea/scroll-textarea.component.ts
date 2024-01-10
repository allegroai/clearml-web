import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {NgForOf, NgIf} from '@angular/common';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'sm-scroll-textarea',
  templateUrl: './scroll-textarea.component.html',
  styleUrls: ['./scroll-textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    CopyClipboardComponent,
    SearchComponent,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    NgForOf,
    MatProgressSpinnerModule,
    CdkFixedSizeVirtualScroll
  ]
})
export class ScrollTextareaComponent {

  lines: string[];
  search: string = '';
  searchResultsCount: number = 0;

  @ViewChild('scroll') scroll: CdkVirtualScrollViewport;
  private _formData: string;
  public indexes: number[] = [];
  public index: number = 0;
  public minimumChars = 1;
  private searchLowercase: string;

  @Input() set formData(data: string) {
    this._formData = data;
    this.lines = data ? data.split('\n').map(line => line.length > 800 ? line.substring(0, 800) + '...' : line) : [];
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

  onFindNextResult(value?: string) {
    const searchBackward = value === null;
    if (value != this.search && !searchBackward) {
      this.resetSearch(value);
      if (value.length > 0 && value.length >= this.minimumChars) {
        this.searchResultsCount = this.lines.filter(line => line.toLowerCase().includes(this.searchLowercase)).length;
      }
    } else {
      this.index = searchBackward ? this.index - 1 : this.index + 1;
    }
      if (this.search?.length > 0) {
        if (this.indexes[this.index] === undefined) {
          const pos = this.lines.slice((this.indexes[this.index - 1] ?? -1) + 1).findIndex(line => line.toLowerCase().includes(this.searchLowercase));
          if (pos > -1) {
            const newIndex = pos + (this.indexes[this.index - 1] ?? -1) + 1;
            this.indexes.push(newIndex);
            this.index = this.indexes.length - 1;
          }
        }
      }
    this.scroll.scrollToIndex(this.indexes[this.index]);
  }

  resetSearch(value?: string) {
    this.indexes = [];
    this.index = 0;
    this.searchResultsCount = 0;
    this.search = value || '';
    this.searchLowercase = value?.toLowerCase() || '';
  }

  split(line: string, search: string) {
    const regex = new RegExp(search, 'gi');
    const match = line.match(regex);
    return line.split(regex).map( (part, i) => [part, match?.[i]]);
  }
}
