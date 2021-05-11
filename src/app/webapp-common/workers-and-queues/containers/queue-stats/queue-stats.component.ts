import {Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {GetStats, SetStats, SetStatsParams} from '../../actions/queues.actions';
import {selectQueuesStatsTimeFrame, selectQueueStats, selectStatsErrorNotice} from '../../reducers/index.reducer';
import {filter} from 'rxjs/operators';
import {Topic} from '../../../shared/utils/statistics';
import {TIME_INTERVALS} from '../../workers-and-queues.consts';
import {IOption} from '../../../shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';

@Component({
  selector: 'sm-queue-stats',
  templateUrl: './queue-stats.component.html',
  styleUrls: ['./queue-stats.component.scss']
})
export class QueueStatsComponent implements OnInit, OnDestroy {
  private chartDataSubscription: Subscription;
  private chartParamSubscription: Subscription;
  public statsError$ = this.store.select(selectStatsErrorNotice);
  public selectedQueue: Queue;
  public refreshChart = true;
  public waitChartData: { dataByTopic: Topic[] };
  public lenChartData: { dataByTopic: Topic[] };

  public timeFrameOptions: IOption[] = [
    {label: '3 Hours', value: (3 * TIME_INTERVALS.HOUR).toString()},
    {label: '6 Hours', value: (6 * TIME_INTERVALS.HOUR).toString()},
    {label: '12 Hours', value: (12 * TIME_INTERVALS.HOUR).toString()},
    {label: '1 Day', value: (TIME_INTERVALS.DAY).toString()},
    {label: '1 Week', value: (TIME_INTERVALS.WEEK).toString()},
    {label: '1 Month', value: (TIME_INTERVALS.MONTH).toString()}];

  @ViewChild('waitchart', {read: ViewContainerRef, static: true}) waitChartRef: ViewContainerRef;
  @ViewChild('lenchart', {read: ViewContainerRef, static: true}) lenChartRef: ViewContainerRef;
  private intervaleHandle: number;
  public currentTimeFrame: string;

  @Input() set queue(queue: Queue) {
    if (this.selectedQueue !== queue) {
      this.selectedQueue = queue;
      this.updateChart();
    }
  }

  constructor(public store: Store<any>) {
  }

  ngOnInit() {
    this.chartParamSubscription = this.store.select(selectQueuesStatsTimeFrame)
      .pipe(filter((timeFrame: string) => !!timeFrame))
      .subscribe((timeFrame) => {
        this.currentTimeFrame = timeFrame;
        this.updateChart();
      });
    this.chartDataSubscription = this.store.select(selectQueueStats).subscribe(
      (data) => {
        if (data && (data.wait || data.length)) {
          this.refreshChart = false;
          this.waitChartData = {dataByTopic: data.wait};
          this.lenChartData = {dataByTopic: data.length};
        }
      }
    );

    this.updateChart();
  }

  ngOnDestroy() {
    this.chartDataSubscription.unsubscribe();
    this.chartParamSubscription.unsubscribe();
    clearInterval(this.intervaleHandle);
  }

  updateChart() {
    clearInterval(this.intervaleHandle);
    this.refreshChart = true;
    this.store.dispatch(new SetStats({data: {wait: null, length: null}}));
    const range = parseInt(this.currentTimeFrame, 10);
    let width = this.waitChartRef.element.nativeElement.clientWidth | 1000;
    width = Math.min(0.8 * width, 1000);
    const granularity = Math.max(Math.floor(range / width), 5);

    this.store.dispatch(new GetStats({maxPoints: width}));
    this.intervaleHandle = window.setInterval(() => {
      this.store.dispatch(new GetStats({maxPoints: width}));
    }, granularity * 1000);
  }

  tickFormatter(seconds: number) {
    seconds = Math.floor(seconds);
    const th = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const tm = `${Math.floor(seconds / 60) % 100}`.padStart(2, '0'); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    const ts = `${seconds % 60}`.padStart(2, '0');
    return `${th}:${tm}:${ts}`;
  }

  timeFrameChanged($event: any) {
    this.store.dispatch(new SetStatsParams({timeFrame: $event}));
  }
}
