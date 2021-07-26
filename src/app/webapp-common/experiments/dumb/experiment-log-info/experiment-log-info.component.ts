import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import {Subscription} from 'rxjs';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {last, findIndex} from 'lodash/fp';
import * as Convert from 'ansi-to-html';
import {Log} from '../../reducers/common-experiment-output.reducer';

import hasAnsi from 'has-ansi';

interface LogRow {
  timestamp?: string;
  entry: string;
  separator?: boolean;
  hasAnsi?: boolean;
}

@Component({
  selector: 'sm-experiment-log-info',
  templateUrl: './experiment-log-info.component.html',
  styleUrls: ['./experiment-log-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentLogInfoComponent implements OnInit, OnDestroy {

  public orgLogs: Log[];
  public lines = [] as LogRow[];
  private initial = true;
  public convert: Convert;
  private hasFilter = false;
  private regex: RegExp;
  private scrollSubscription: Subscription;
  private indexSubscription: Subscription;
  private shouldFocusLog = true;
  public fetching = false;
  private scrolling: boolean = false;
  private prevLocation = 0;
  public canRefresh = true;
  private prevLine: LogRow;
  private fetchPrev: boolean;
  private prevLineOffset: number;

  @ViewChild('LogContainer', {static: true}) private logContainer: CdkVirtualScrollViewport;
  @Input() beginningOfLog: boolean;
  @Input() isDarkTheme: boolean;
  private hasAnsi: any;

  @Input() set filterString(filter: string) {
    this.shouldFocusLog = false;
    setTimeout(() => this.shouldFocusLog = true, 1000);
    this.hasFilter = !!filter;
    if (this.hasFilter) {
      this.regex = ExperimentLogInfoComponent.getRegexFromString(filter);
    }

    if (this.orgLogs) {
      this.calcLines();
    }
  }

  @Input() set logs(log: Log[]) {
    if (log === null) {
      return;
    }
    this.orgLogs = log;
    this.calcLines();
    let prevLocation = findIndex(this.prevLine, this.lines) + this.prevLineOffset;
    if (this.fetchPrev) {
      prevLocation -= 25;
    }
    this.fetchPrev = null;
    if (this.fetching) {
      this.scrolling = true;
      window.setTimeout(() => {
        this.logContainer.scrollToIndex(prevLocation);
        window.setTimeout(() => this.scrolling = false, 50);
      });
    } else {
      const elm = this.logContainer.elementRef.nativeElement;
      if (log?.length && (elm.scrollTop + elm.offsetHeight > elm.scrollHeight - 100 || this.initial)) {
        this.initial = false;
        this.scrolling = true;
        window.setTimeout(() => {
          this.logContainer.scrollToIndex(this.lines.length);
          this.canRefresh = true;
          window.setTimeout(() => this.scrolling = false, 80);
        }, 10);
      }
    }
    window.setTimeout(() => {
      this.fetching = false;
      this.cdr.detectChanges();
    }, 50);
  }

  @Output() fetchMore = new EventEmitter<{ direction: string; from?: number }>();

  constructor(private cdr: ChangeDetectorRef) {
    this.convert = new Convert();
    this.hasAnsi = hasAnsi;
  }

  ngOnInit() {
    this.scrollSubscription = this.logContainer.elementScrolled().subscribe((event: Event) => {
      if (this.shouldFocusLog) {
        setTimeout(() => (event.target as HTMLElement).focus(), 50);
      }
    });
    window.setTimeout(() => {
      this.indexSubscription = this.logContainer.scrolledIndexChange.subscribe((location: number) => {
        if (!this.fetching && !this.scrolling) {
          const itemsInView = Math.ceil(this.logContainer.getViewportSize() / 25);
          if (location < 10 && location < this.prevLocation && !this.beginningOfLog) {
            this.fetching = true;
            this.cdr.detectChanges();
            this.fetchPrev = true;
            this.fetchMore.emit({direction: 'prev', from: this.orgLogs?.[0]?.timestamp});
          } else if (location >= this.lines.length - itemsInView && location > this.prevLocation) {
            this.fetching = true;
            this.cdr.detectChanges();
            this.fetchMore.emit({direction: 'next', from: last(this.orgLogs)?.timestamp});
          }
        }
        this.prevLocation = location;
        this.prevLine = {} as LogRow;
        let i = 0;
        while (!this.prevLine.timestamp) {
          this.prevLine = this.lines[location - i];
          i += 1;
        }
        this.prevLineOffset = i;
        if (this.canRefresh !== location > this.lines.length - 30) {
          this.canRefresh = !this.canRefresh;
          this.cdr.detectChanges();
        }
      });
    }, 500);
  }

  ngOnDestroy() {
    this.scrollSubscription?.unsubscribe();
    this.indexSubscription?.unsubscribe();
  }

  private static getRegexFromString(filter: string) {
    const flags = filter.match(/.*\/([gimy]*)$/);
    if (flags) {
      const pattern = flags ? filter.replace(new RegExp('^/(.*?)/' + flags[1] + '$'), '$1') : filter;
      filter.replace(new RegExp('^/(.*?)/' + flags[1] + '$'), '$1');
      return new RegExp(pattern, flags[1]);
    } else {
      return new RegExp(filter, 'i');
    }
  }

  calcLines() {
    this.lines = [];
    this.orgLogs.filter((row) => !this.hasFilter || this.regex.test(row.msg))
      .forEach(logItem => {
        let first = true;
        logItem.msg.split('\n').filter(msg => !!msg).forEach((msg: string) => {
          const hasAnsi = this.hasAnsi(msg);
          const converted = msg ? (hasAnsi ? this.convert.toHtml(msg) :
            msg) : '';
          if (first) {
            this.lines.push({timestamp: logItem['timestamp'] || logItem['@timestamp'], entry: converted, hasAnsi: hasAnsi});
            first = false;
          } else {
            this.lines.push({entry: converted, hasAnsi: hasAnsi});
          }
        });
        this.lines[this.lines.length - 1].separator = true;
      });
  }

  trackByTimestampFn(index: number, line: LogRow) {
    return line.timestamp;
  }

  reset() {
    this.initial = true;
    this.fetching = false;
    this.cdr.detectChanges();
  }

  getLast() {
    this.prevLine = null;
    this.prevLineOffset = 0;
    this.initial = true;
    this.fetchMore.emit({direction: 'prev'});
  }
}
