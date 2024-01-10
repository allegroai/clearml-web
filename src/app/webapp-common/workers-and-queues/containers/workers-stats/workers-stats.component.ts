import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {combineLatest, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {Worker} from '~/business-logic/model/workers/worker';
import {Topic} from '@common/shared/utils/statistics';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';
import {getWorkers, setStats, setStatsParams} from '../../actions/workers.actions';
import {
  selectStats,
  selectStatsErrorNotice,
  selectStatsParams,
  selectStatsTimeFrame
} from '../../reducers/index.reducer';
import {timeFrameOptions} from '@common/constants';

@Component({
  selector: 'sm-workers-graph',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    if (this.activeWorker?.id !== worker?.id) {
      this.activeWorker = worker;
      if (worker) {
        this.yAxisLabel = this.yAxisLabels[this.currentParam];
      }
      this.chartChanged();
    }
  }

  timeFrameOptions = timeFrameOptions;
  public chartParamOptions: IOption[] = [
    {label: 'CPU and GPU Usage', value: 'cpu_usage;gpu_usage'},
    {label: 'Memory Usage', value: 'memory_used'},
    {label: 'Video Memory', value: 'gpu_memory_used'},
    {label: 'Network Usage', value: 'network_rx;network_tx'},
    //    {label: 'Frames Processed', value: 'frames'},
  ];

  public yAxisLabels = {
    /* eslint-disable @typescript-eslint/naming-convention */
    'cpu_usage;gpu_usage': 'Usage %',
    memory_used: 'Bytes',
    gpu_memory_used: 'Bytes',
    'network_rx;network_tx': 'Bytes/sec'
    /* eslint-enable @typescript-eslint/naming-convention */
  };

  public chartData: Topic[];

  constructor(public store: Store, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.chartParamSubscription = combineLatest([
      this.store.select(selectStatsTimeFrame),
      this.store.select(selectStatsParams)
    ])
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
          this.chartData = data;
          this.cdr.detectChanges();
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

    this.store.dispatch(setStats({data: null}));
    this.store.dispatch(getWorkers({maxPoints: width}));

    this.intervaleHandle = window.setInterval(() => {
      this.store.dispatch(getWorkers({maxPoints: width}));
    }, granularity * 1000);
  }

  chartParamChange(event) {
    this.currentParam = event;
    this.store.dispatch(setStatsParams({timeFrame: this.currentTimeFrame, param: this.currentParam}));
  }

  timeFrameChange(event) {
    this.currentTimeFrame = event;
    this.store.dispatch(setStatsParams({timeFrame: this.currentTimeFrame, param: this.currentParam}));
  }
}
