import {Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {IOption} from '../../../shared/ui-components/inputs/select-autocomplete/select-autocomplete.component';
import {GetStats, SetStats, SetStatsParams} from '../../actions/queues.actions';
import {selectQueueStats, selectQueuesStatsTimeFrame, selectStatsErrorNotice} from '../../reducers/index.reducer';
import {filter} from 'rxjs/operators';
import {Topic} from '../../../shared/utils/statistics';
import {hideNoStatsNotice} from '../../actions/stats.actions';

@Component({
  selector: 'sm-queue-stats',
  templateUrl: './queue-stats.component.html',
  styleUrls: ['./queue-stats.component.scss']
})
export class QueueStatsComponent implements OnInit, OnDestroy {
  private chartDataSubscription: Subscription;
  private timeSelectionSubscription: Subscription;
  private chartParamSubscription: Subscription;
  public statsError$ = this.store.select(selectStatsErrorNotice);
  public selectedQueue: Queue;
  public timeFormControl = new FormControl();
  public refreshChart = true;
  public waitChartData: { dataByTopic: Topic[] };
  public lenChartData: { dataByTopic: Topic[] };

  public timeFrameOptions: IOption[] = [
    {label: '3 Hours', value: (3 * 60 * 60).toString()},
    {label: '6 Hours', value: (6 * 60 * 60).toString()},
    {label: '12 Hours', value: (12 * 60 * 60).toString()},
    {label: '1 Day', value: (24 * 60 * 60).toString()},
    {label: '1 Week', value: (7 * 24 * 60 * 60).toString()},
    {label: '1 Month', value: (30 * 24 * 60 * 60).toString()}];

  @ViewChild('waitchart', {read: ViewContainerRef, static: true}) waitChartRef: ViewContainerRef;
  @ViewChild('lenchart', {read: ViewContainerRef, static: true}) lenChartRef: ViewContainerRef;
  private intervaleHandle: number;

  @Input() set queue(queue: Queue) {
    if (this.selectedQueue !== queue) {
      this.selectedQueue = queue;
      this.updateChart();
    }
  }

  constructor(public store: Store<any>) {
  }

  ngOnInit() {
    this.timeFormControl.setValue(this.timeFrameOptions[0].value);
    this.timeSelectionSubscription = this.timeFormControl.valueChanges
      .subscribe(timeFrame => {
        this.store.dispatch(new SetStatsParams({timeFrame}));
      });

    this.chartParamSubscription = this.store.select(selectQueuesStatsTimeFrame)
      .pipe(filter((timeFrame: string) => !!timeFrame))
      .subscribe((timeFrame) => {
        this.timeFormControl.setValue(timeFrame);
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
    this.timeSelectionSubscription.unsubscribe();
    this.chartDataSubscription.unsubscribe();
    this.chartParamSubscription.unsubscribe();
    clearInterval(this.intervaleHandle);
  }

  updateChart() {
    clearInterval(this.intervaleHandle);
    this.refreshChart = true;
    this.store.dispatch(new SetStats({data: {wait: null, length: null}}));
    const range = this.timeFormControl.value;
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
}
