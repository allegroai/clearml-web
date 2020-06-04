import {ChangeDetectionStrategy, Component, Input, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import * as Convert from 'ansi-to-html';

interface ILogRow {
  timestamp?: string;
  entry: string;
  separator?: boolean;
}

@Component({
  selector: 'sm-experiment-log-info',
  templateUrl: './experiment-log-info.component.html',
  styleUrls: ['./experiment-log-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentLogInfoComponent implements OnInit, OnDestroy {

  private orgLogs: Array<any>;
  public lines: ILogRow[];
  private initial = true;
  public convert: any;
  private hasFilter: boolean = false;
  private regex: RegExp;
  private scrollSubscription: Subscription;
  private shouldFocusLog = true;

  @ViewChild('LogContainer', {static: true}) private logContainer: CdkVirtualScrollViewport;

  @Input() set filterString(filter: string) {
    this.shouldFocusLog = false;
    setTimeout(() => this.shouldFocusLog = true, 1000);
    this.hasFilter = !!filter;
    if (this.hasFilter) {
      this.regex = this.getRegexFromString(filter);
    }

    if (this.orgLogs) {
      this.calcLines();
    }
  }

  @Input() set logs(log: Array<any>) {
    if (log === null) {
      return;
    }
    this.orgLogs = log;
    this.calcLines();
    const elm = this.logContainer.elementRef.nativeElement;
    if (log && log.length && (elm.scrollTop + elm.offsetHeight > elm.scrollHeight - 100 || this.initial)) {
      this.initial = false;
      setTimeout(() => this.logContainer.scrollToIndex(this.lines.length), 10);
    }
  }

  constructor() {
    this.convert = new Convert();
  }

  ngOnInit() {
    this.scrollSubscription = this.logContainer.elementScrolled().subscribe((event: Event) => {
      if(this.shouldFocusLog) {
        setTimeout(() => (<HTMLElement>event.target).focus(), 50);
      }
    })
  }

  ngOnDestroy() {
    this.scrollSubscription.unsubscribe();
  }

  private getRegexFromString(filter: string) {
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
        const converted = msg ? this.convert.toHtml(msg) : '';
        if (first) {
          this.lines.push({timestamp: logItem['timestamp'] || logItem['@timestamp'], entry: converted});
          first = false;
        } else {
          this.lines.push({entry: converted});
        }
      });
      this.lines[this.lines.length - 1].separator = true;
    });
  }

  trackByTimestampFn(line: ILogRow) {
    return line.timestamp;
  }
}
