import {AfterViewInit, ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ExtFrame, ExtLegend} from '../plotly-graph-base';
import {Store} from '@ngrx/store';
import {Observable, Subject, Subscription} from 'rxjs';
import {cloneDeep} from 'lodash-es';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MatSelectChange} from '@angular/material/select';
import {debounceTime, filter, map, take} from 'rxjs/operators';
import {convertPlots, groupIterations} from '@common/tasks/tasks.utils';
import {addMessage} from '@common/core/actions/layout.actions';
import {
  getGraphDisplayFullDetailsScalars, getNextPlotSample, getPlotSample, setGraphDisplayFullDetailsScalars, setGraphDisplayFullDetailsScalarsIsOpen, setViewerBeginningOfTime, setViewerEndOfTime,
  setXtypeGraphDisplayFullDetailsScalars
} from '@common/shared/single-graph/single-graph.actions';
import {
  selectCurrentPlotViewer, selectFullScreenChart, selectFullScreenChartIsFetching, selectFullScreenChartXtype, selectMinMaxIterations, selectViewerBeginningOfTime, selectViewerEndOfTime
} from '@common/shared/single-graph/single-graph.reducer';
import {getSignedUrl} from '@common/core/actions/common-auth.actions';
import {selectSignedUrl} from '@common/core/reducers/common-auth-reducer';
import {AxisType} from 'plotly.js';
import {SmoothTypeEnum, smoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';
import {ChartHoverModeEnum, SingleGraphComponent} from '@common/shared/single-graph/single-graph.component';

export interface GraphViewerData {
  chart: ExtFrame;
  id: string;
  xAxisType?: any;
  yAxisType?: AxisType;
  smoothWeight?: number;
  smoothType?: SmoothTypeEnum;
  hoverMode?: ChartHoverModeEnum;
  darkTheme: boolean;
  isCompare: boolean;
  moveLegendToTitle: boolean;
  embedFunction: (data: {xaxis: ScalarKeyEnum; domRect: DOMRect}) => void;
  legendConfiguration: Partial<ExtLegend & { noTextWrap: boolean }>;
}

@Component({
  selector: 'sm-graph-viewer',
  templateUrl: './graph-viewer.component.html',
  styleUrls: ['./graph-viewer.component.scss']
})
export class GraphViewerComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('singleGraph') singleGraph: SingleGraphComponent;
  @ViewChild('modalContainer') modalContainer;
  public height;
  public width;
  private sub = new Subscription();
  public minMaxIterations$: Observable<{ minIteration: number; maxIteration: number }>;
  public isFetchingData$: Observable<boolean>;
  public xAxisType$: Observable<'iter' | 'timestamp' | 'iso_time'>;
  public xAxisType: 'iter' | 'timestamp' | 'iso_time';
  public isCompare: boolean;
  public isFullDetailsMode: boolean;
  public iteration: number;
  public beginningOfTime$: Observable<boolean>;
  public endOfTime$: Observable<boolean>;
  public currentPlotEvent$: Observable<any>;
  private iterationChanged$ = new Subject<number>();
  private isForward: boolean = true;
  private charts: ExtFrame[];
  public index: number = null;
  public embedFunction: (data: {xaxis: ScalarKeyEnum; domRect: DOMRect}) => void;
  public yAxisType: AxisType;
  public showSmooth: boolean;
  protected readonly smoothTypeEnum = smoothTypeEnum;
  public smoothType: SmoothTypeEnum;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
      case 'ArrowUp':
        this.nextIteration();
        break;
      case 'ArrowDown':
        this.previousIteration();
        break;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.singleGraph.shouldRefresh = true;
    this.width = this.modalContainer.nativeElement.clientWidth;
    this.height = this.modalContainer.nativeElement.clientHeight - 80;
  }

  public chart: ExtFrame;
  public id: string;
  public darkTheme: boolean;
  public chart$: Observable<ExtFrame>;
  public plotLoaded: boolean = false;
  public beginningOfTime: boolean = false;
  public endOfTime: boolean = false;
  smoothWeight: any = 0;
  xAxisTypeOption = [
    {
      name: 'Iterations',
      value: ScalarKeyEnum.Iter
    },
    {
      name: 'Time from start',
      value: ScalarKeyEnum.Timestamp
    },
    {
      name: 'Wall time',
      value: ScalarKeyEnum.IsoTime
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GraphViewerData,
    public dialogRef: MatDialogRef<GraphViewerComponent>,
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {
    this.chart$ = this.store.select(selectFullScreenChart);
    this.currentPlotEvent$ = this.store.select(selectCurrentPlotViewer);
    this.xAxisType$ = this.store.select(selectFullScreenChartXtype);
    this.isFetchingData$ = this.store.select(selectFullScreenChartIsFetching);
    this.minMaxIterations$ = this.store.select(selectMinMaxIterations);
    this.beginningOfTime$ = this.store.select(selectViewerBeginningOfTime);
    this.endOfTime$ = this.store.select(selectViewerEndOfTime);
    if (data.xAxisType) {
      this.store.dispatch(setXtypeGraphDisplayFullDetailsScalars({xAxisType: data.xAxisType}));
    }
    this.store.dispatch(setGraphDisplayFullDetailsScalarsIsOpen({isOpen: true}));
    this.isCompare = data.isCompare;
    this.yAxisType = data.yAxisType ?? 'linear';
    this.showSmooth = ['multiScalar', 'scalar'].includes(data.chart.layout.type);
    this.isFullDetailsMode = this.showSmooth && !this.isCompare;
    this.id = data.id;
    this.embedFunction = data.embedFunction;
    this.darkTheme = data.darkTheme;
    this.smoothWeight = data.smoothWeight ?? 0;
    this.smoothType = data.smoothType ?? smoothTypeEnum.exponential;

    const reqData = {
      task: this.data.chart.task,
      metric: this.data.chart.metric,
      iteration: this.data.chart.iter
    };
    if (this.isFullDetailsMode) {
      this.store.dispatch(setGraphDisplayFullDetailsScalars({data: data.chart}));
    } else if (this.isCompare || this.darkTheme) {
      this.chart = data.chart;
    } else {
      this.store.dispatch(getPlotSample(reqData));
    }
  }


  ngOnInit(): void {
    ////////////// SCALARS //////////////////////
    if (this.isFullDetailsMode) {
      this.store.dispatch(getGraphDisplayFullDetailsScalars({
        task: this.data.chart.data[0].task,
        metric: {metric: (this.data.chart.data[0].originalMetric ?? this.data.chart.metric)},
      }));
    }
    this.sub.add(this.xAxisType$.subscribe((xType) => this.xAxisType = xType));

    ////////////// PLOTS //////////////////////

    this.sub.add(this.currentPlotEvent$
      .pipe(filter(plot => !!plot))
      .subscribe(currentPlotEvents => {
        this.plotLoaded = true;
        const groupedPlots = groupIterations(currentPlotEvents);
        const {graphs, parsingError} = convertPlots({plots: groupedPlots, id: 'viewer'});
        parsingError && this.store.dispatch(addMessage('warn', `Couldn't read all plots. Please make sure all plots are properly formatted (NaN & Inf aren't supported).`, [], true));
        Object.values(graphs).forEach((graphss: ExtFrame[]) => {
          graphss.forEach((graph: ExtFrame) => {
            graph.data?.forEach((d, i) => d.visible = this.data.chart.data[i]?.visible)
            // if (this.data.chart?.layout?.showlegend === false) {
              graph.layout.showlegend = this.data.chart?.layout?.showlegend ?? false;
            // }
            if ((graph?.layout?.images?.length ?? 0) > 0) {
              graph.layout.images.forEach((image: Plotly.Image) => {
                  this.store.dispatch(getSignedUrl({
                    url: image.source,
                    config: {skipFileServer: false, skipLocalFile: false, disableCache: graph.timestamp}
                  }));
                  this.sub.add(this.store.select(selectSignedUrl(image.source))
                    .pipe(
                      filter(signed => !!signed?.signed),
                      map(({signed: signedUrl}) => signedUrl),
                      take(1)
                    ).subscribe(url => image.source = url)
                  );
                }
              );
            }
          });
        });

        this.charts = Object.values(graphs)[0];
        if (this.index === null) {
          this.index = Math.max(this.charts.findIndex(c => c.variant === this.data.chart.variant), 0);
        } else {
          this.index = this.charts.findIndex(chrt => chrt.metric === this.chart?.metric && chrt.variant === this.chart?.variant);
          this.index = this.index === -1 ? (this.isForward ? 0 : this.charts.length - 1) : this.index;
        }
        this.chart = null;
        this.cdr.detectChanges();
        this.chart = this.charts[this.index];
        this.iteration = currentPlotEvents[0].iter;
      }));
    this.sub.add(this.beginningOfTime$.subscribe(beg => {
      this.beginningOfTime = beg;
      if (beg) {
        this.plotLoaded = true;
      }
    }));
    this.sub.add(this.endOfTime$.subscribe(end => {
      this.endOfTime = end;
      if (end) {
        this.plotLoaded = true;
      }
    }));
  }

  ngAfterViewInit(): void {
    if (!this.isFullDetailsMode && (this.isCompare || this.darkTheme)) {
      this.plotLoaded = true;
      setTimeout(() => {
        this.singleGraph.redrawPlot();
        this.cdr.detectChanges();
      }, 50);
    }
    this.height = this.modalContainer.nativeElement.clientHeight - 80;
    this.sub.add(this.chart$
      .pipe(filter(plot => !!plot))
      .subscribe(chart => {
        this.plotLoaded = true;
        if (this.singleGraph) {
          this.singleGraph.shouldRefresh = true;
        }
        this.chart = cloneDeep(chart);
        console.log(this.chart?.data[0].line?.color);
        this.cdr.detectChanges();
      }));
    this.sub.add(this.iterationChanged$
      .pipe(debounceTime(100))
      .subscribe((value) => {
        const reqData = {
          task: this.chart.task,
          metric: this.chart.metric,
          iteration: value
        };
        this.store.dispatch(getPlotSample(reqData));
      }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(setGraphDisplayFullDetailsScalarsIsOpen({isOpen: false}));
    this.store.dispatch(setViewerBeginningOfTime({beginningOfTime: false}));
    this.store.dispatch(setViewerEndOfTime({endOfTime: false}));
    this.sub.unsubscribe();
  }

  closeGraphViewer() {
    this.dialogRef.close();
  }

  ////////////////////// SCALARS /////////////////////////////////////
  xAxisTypeChanged($event: MatSelectChange) {
    if (
      ((ScalarKeyEnum.Iter === this.xAxisType) && [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes($event.value)) ||
      ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(this.xAxisType) && (ScalarKeyEnum.Iter === ($event.value)))) {
      this.store.dispatch(getGraphDisplayFullDetailsScalars({
        task: this.chart.data[0].task,
        metric: {metric: (this.data.chart.data[0].originalMetric ?? this.data.chart.metric)},
        key: $event.value
      }));
    } else {
      this.store.dispatch(setXtypeGraphDisplayFullDetailsScalars({xAxisType: $event.value}));
    }
  }

  changeWeight(value: number) {
    if (value === 0 || value === null) {
      return;
    }
    if (value > (this.smoothType === smoothTypeEnum.exponential ? 0.999 : 100) || value < (this.smoothType === smoothTypeEnum.exponential ? 0 : 1)) {
      this.smoothWeight = null;
    }
    setTimeout(() => {
      if (this.smoothType === smoothTypeEnum.exponential) {
        if (value > 0.999) {
          this.smoothWeight = 0.999;
        } else if (value < 0) {
          this.smoothWeight = 0;
        }
      } else {
        if (value > 100) {
          this.smoothWeight = 100;
        } else if (value < 1) {
          this.smoothWeight = 1;
        }
      }
      this.cdr.detectChanges();
    });
  }

  refresh() {
    this.store.dispatch(getGraphDisplayFullDetailsScalars({
      task: this.chart.data[0].task,
      metric: {metric: (this.data.chart.data[0].originalMetric ?? this.data.chart.metric)}
    }));
  }

  ////////////////////// PLOTS /////////////////////////////////////

  changeIteration(value: number) {
    this.iteration = value;
    if (this.chart) {
      this.iterationChanged$.next(value);
    }
  }

  next() {
    if (this.canGoNext() && this.chart && !this.darkTheme) {
      this.isForward = true;
      const task = this.chart.task;
      if (this.charts?.[this.index + 1]) {
        this.chart = null;
        this.chart = this.charts[++this.index];
        this.store.dispatch(setViewerBeginningOfTime({beginningOfTime: false}));
      } else {
        this.plotLoaded = false;
        this.store.dispatch(getNextPlotSample({task, navigateEarlier: false}));
      }
    }
  }

  previous() {
    if (this.canGoBack() && this.chart && !this.darkTheme) {
      this.isForward = false;
      const task = this.chart.task;
      if (this.charts?.[this.index - 1]) {
        this.chart = null;
        this.chart = this.charts[--this.index];
        this.store.dispatch(setViewerEndOfTime({endOfTime: false}));
      } else {
        this.plotLoaded = false;
        this.store.dispatch(getNextPlotSample({task, navigateEarlier: true}));
      }
    }
  }

  nextIteration() {
    if (!this.isFullDetailsMode && this.canGoNext() && this.chart && !this.darkTheme) {
      this.plotLoaded = false;
      this.store.dispatch(getNextPlotSample({task: this.chart.task, navigateEarlier: false, iteration: true}));
    }
  }

  previousIteration() {
    if (!this.isFullDetailsMode && this.canGoBack() && this.chart && !this.darkTheme) {
      this.plotLoaded = false;
      this.store.dispatch(getNextPlotSample({task: this.chart.task, navigateEarlier: true, iteration: true}));
    }
  }

  canGoNext() {
    return !this.endOfTime && this.plotLoaded;
  }

  canGoBack() {
    return !this.beginningOfTime && this.plotLoaded;
  }

  selectSmoothType($event: MatSelectChange) {
    this.smoothWeight = [smoothTypeEnum.exponential, smoothTypeEnum.any].includes($event.value) ? 0 : 10;
    this.smoothType = $event.value;
  }
}
