import {Component, OnInit, Input, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {Worker} from '../../../../business-logic/model/workers/worker';
import {Subscription, combineLatest} from 'rxjs';
import {Store} from '@ngrx/store';
import {GetStatsAndWorkers, SetStats, SetStatsParams} from '../../actions/workers.actions';
import {selectStatsTimeFrame, selectStatsParams, selectStats, selectStatsErrorNotice} from '../../reducers/index.reducer';
import {filter} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {TIME_INTERVALS} from '../../workers-and-queues.consts';
import {Topic} from '../../../shared/utils/statistics';
import {IOption} from '../../../shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';

@Component({
  selector: 'sm-workers-graph',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.scss']
})
export class WorkersStatsComponent implements OnInit, OnDestroy {
  private chartDataSubscription: Subscription;
  private chartParamSubscription: Subscription;
  public statsError$ = this.store.select(selectStatsErrorNotice);
  private intervaleHandle: number;
  public currentParam: string;
  public currentTimeFrame: string;
  public refreshChart = true;
  public activeWorker: Worker;
  public yAxisLabel: string;

  @ViewChild('chart', {read: ViewContainerRef, static: true}) chartRef: ViewContainerRef;

  @Input() set worker(worker: Worker) {
    if (get('id', this.activeWorker) !== get('id', worker)) {
      this.activeWorker = worker;
      if (worker) {
        this.yAxisLabel = this.yAxisLabels[this.currentParam];
      }
      this.chartChanged();
    }
  }

  public timeFrameOptions: IOption[] = [
    {label: '3 Hours', value: (3 * TIME_INTERVALS.HOUR).toString()},
    {label: '6 Hours', value: (6 * TIME_INTERVALS.HOUR).toString()},
    {label: '12 Hours', value: (12 * TIME_INTERVALS.HOUR).toString()},
    {label: '1 Day', value: (TIME_INTERVALS.DAY).toString()},
    {label: '1 Week', value: (TIME_INTERVALS.WEEK).toString()},
    {label: '1 Month', value: (TIME_INTERVALS.MONTH).toString()}];

  public chartParamOptions: IOption[] = [
    {label: 'CPU and GPU Usage', value: 'cpu_usage;gpu_usage'},
    {label: 'Memory Usage', value: 'memory_used'},
    {label: 'Video Memory', value: 'gpu_memory_used'},
    {label: 'Network Usage', value: 'network_rx;network_tx'},
    //    {label: 'Frames Processed', value: 'frames'},
  ];

  public yAxisLabels = {
    'cpu_usage;gpu_usage': 'Usage %',
    memory_used: 'Bytes',
    gpu_memory_used: 'Bytes',
    'network_rx;network_tx': 'Bytes/sec'
  };

  public chartData: { dataByTopic: Topic[] };

  constructor(public store: Store<any>) {
  }

  ngOnInit() {


    this.chartParamSubscription = combineLatest([this.store.select(selectStatsTimeFrame), this.store.select(selectStatsParams)])
      .pipe(filter(([timeFrame, param]) => !!timeFrame && !!param))
      .subscribe(([timeFrame, param]) => {
        this.currentParam = param;
        this.currentTimeFrame = timeFrame;
        this.yAxisLabel = this.activeWorker ? this.yAxisLabels[param] : 'Count';
        this.chartChanged();
      });

    this.chartDataSubscription = this.store.select(selectStats).subscribe(
      (data) => {
        if (data) {
          this.refreshChart = false;
          this.chartData = {dataByTopic: data};
        }
      }
    );

    this.chartChanged();
  }

  ngOnDestroy() {
    this.chartDataSubscription.unsubscribe();
    this.chartParamSubscription.unsubscribe();
    clearInterval(this.intervaleHandle);
  }

  chartChanged() {
    const range = parseInt(this.currentTimeFrame, 10);
    clearInterval(this.intervaleHandle);
    this.refreshChart = true;
    let width = this.chartRef.element.nativeElement.clientWidth || 1000;
    width = Math.min(0.8 * width, 1000);
    const granularity = Math.max(Math.floor(range / width), this.activeWorker ? 10 : 40);

    this.store.dispatch(new SetStats({data: null}));
    this.store.dispatch(new GetStatsAndWorkers({maxPoints: width}));

    this.intervaleHandle = window.setInterval(() => {
      this.store.dispatch(new GetStatsAndWorkers({maxPoints: width}));
    }, granularity * 1000);
  }

  chartParamChange(event) {
    this.currentParam = event;
    this.store.dispatch(new SetStatsParams({timeFrame: this.currentTimeFrame, param: this.currentParam}));
  }

  timeFrameChange(event) {
    this.currentTimeFrame = event;
    this.store.dispatch(new SetStatsParams({timeFrame: this.currentTimeFrame, param: this.currentParam}));
  }
}
