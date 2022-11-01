import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef, AfterViewInit, ElementRef
} from '@angular/core';
import {Subscription} from 'rxjs';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {last, findIndex} from 'lodash/fp';
import Convert from 'ansi-to-html';
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
export class ExperimentLogInfoComponent implements OnDestroy, AfterViewInit {
  public orgLogs: Log[];
  public lines = [] as LogRow[];
  private initial = true;
  public convert = new Convert() as Convert;
  private hasFilter = false;
  private regex: RegExp;
  private scrollSubscription: Subscription;
  private indexSubscription: Subscription;
  private shouldFocusLog = false;
  private scrolling: boolean = false;
  private prevLocation = 0;
  public canRefresh = true;
  private prevLine: LogRow;
  private fetchPrev: boolean;
  private prevLineOffset: number;

  @ViewChild(CdkVirtualScrollViewport) private logContainer: CdkVirtualScrollViewport;
  @Input() fetching = false;
  @Input() beginningOfLog: boolean;
  @Input() isDarkTheme: boolean;
  private readonly hasAnsi = hasAnsi;
  private observer: IntersectionObserver;
  private logInView: boolean;
  public atEnd = true;

  @Input() set filterString(filter: string) {
    if (this.logInView) {
      this.shouldFocusLog = false;
      setTimeout(() => this.shouldFocusLog = true, 1000);
    }
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
    const autoRefresh = this.fetchPrev === null;
    this.orgLogs = log;
    this.calcLines();
    let prevLocation;
    if (autoRefresh && this.atEnd) {
      prevLocation = this.lines.length;
    } else {
      prevLocation = findIndex(this.prevLine, this.lines) + this.prevLineOffset;
    }
    this.fetchPrev = null;
    if (!this.initial && prevLocation) {
      this.scrolling = true;
      window.setTimeout(() => {
        this.logContainer?.scrollToIndex(prevLocation);
        window.setTimeout(() => this.scrolling = false, 50);
      });
    } else {
      const elm = this.logContainer?.elementRef.nativeElement;
      if (!elm || log?.length && (elm.scrollTop + elm.offsetHeight > elm.scrollHeight - 100 || this.initial)) {
        this.initial = false;
        this.scrolling = true;
        window.setTimeout(() => {
          this.logContainer?.scrollToIndex(this.lines.length);
          this.canRefresh = true;
          window.setTimeout(() => this.scrolling = false, 80);
        }, 10);
      }
    }
  }

  @Output() fetchMore = new EventEmitter<{ direction: string; from?: number }>();

  constructor(private cdr: ChangeDetectorRef, private element: ElementRef) {}

  ngAfterViewInit() {
    this.scrollSubscription = this.logContainer?.elementScrolled().subscribe((event: Event) => {
      if (this.shouldFocusLog) {
        setTimeout(() => (event.target as HTMLElement).focus(), 50);
      }
    });

    window.setTimeout(() => {
      this.indexSubscription = this.logContainer?.scrolledIndexChange.subscribe((location: number) => {
        const itemsInView = Math.ceil(this.logContainer?.getViewportSize() / 25);
        this.atEnd = location >= this.lines.length - itemsInView - 1;
        if (!this.fetching && !this.scrolling) {
          if (location < 10 && location < this.prevLocation && !this.beginningOfLog) {
            this.fetchPrev = true;
            this.fetchMore.emit({direction: 'prev', from: this.orgLogs?.[0]?.timestamp});
          } else if (this.atEnd && location > this.prevLocation) {
            this.fetchPrev = false;
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
        this.prevLineOffset = Math.max(i - 1, 0);
        if (this.canRefresh !== location > this.lines.length - 30) {
          this.canRefresh = !this.canRefresh;
          this.cdr.detectChanges();
        }
      });
    }, 500);

    this.observer = new IntersectionObserver((entries => {
      this.logInView = entries[0].isIntersecting;
      this.shouldFocusLog = entries[0].isIntersecting;
    }), {threshold: 0.7});
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.scrollSubscription?.unsubscribe();
    this.indexSubscription?.unsubscribe();
    this.logContainer = null;
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
    this.orgLogs
      .filter((row) => !this.hasFilter || this.regex.test(row?.msg ?? ''))
      .forEach(logItem => {
        let first = true;
        if (!logItem.msg) {
          this.lines.push({timestamp: logItem['timestamp'] || logItem['@timestamp'], entry: '', hasAnsi: false, separator: true});
          return;
        }
        logItem.msg
          .split('\n')
          .filter(msg => !!msg)
          .forEach((msg: string) => {
            const msgHasAnsi = this.hasAnsi(msg);
            const converted = msg ? (msgHasAnsi ? this.convert.toHtml(msg) :
              msg) : '';
            if (first) {
              this.lines.push({timestamp: logItem['timestamp'] || logItem['@timestamp'], entry: converted, hasAnsi: msgHasAnsi});
              first = false;
            } else {
              this.lines.push({entry: converted, hasAnsi: msgHasAnsi});
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
    this.cdr.detectChanges();
  }

  getLast() {
    this.prevLine = null;
    this.prevLineOffset = 0;
    this.initial = true;
    this.fetchMore.emit({direction: 'prev'});
  }
}
