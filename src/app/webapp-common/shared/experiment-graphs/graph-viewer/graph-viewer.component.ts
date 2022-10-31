import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ExtFrame} from '../single-graph/plotly-graph-base';
import {Store} from '@ngrx/store';
import {
  getGraphDisplayFullDetailsScalars, getNextPlotSample, getPlotSample,
  setGraphDisplayFullDetailsScalars,
  setGraphDisplayFullDetailsScalarsIsOpen,
  setXtypeGraphDisplayFullDetailsScalars
} from '@common/experiments/actions/common-experiment-output.actions';
import {Observable} from 'rxjs/internal/Observable';
import {Subject, Subscription} from 'rxjs';
import {cloneDeep, getOr} from 'lodash/fp';
import {
  selectCurrentPlotViewer,
  selectViewerBeginningOfTime, selectViewerEndOfTime,
  selectFullScreenChart,
  selectFullScreenChartIsFetching,
  selectFullScreenChartXtype, selectMinMaxIterations
} from '@common/experiments/reducers';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MatSelectChange} from '@angular/material/select';
import {debounceTime, filter, map, take} from 'rxjs/operators';
import {convertPlot} from '@common/tasks/tasks.utils';
import {selectSignedUrl} from '@common/core/reducers/common-auth-reducer';
import {getSignedUrl} from '@common/core/actions/common-auth.actions';

@Component({
  selector: 'sm-graph-viewer',
  templateUrl: './graph-viewer.component.html',
  styleUrls: ['./graph-viewer.component.scss']
})
export class GraphViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('singleGraph') singleGraph;
  @ViewChild('modalContainer') modalContainer;
  public height;
  private sub = new Subscription();
  public minMaxIterations$: Observable<{minIteration: number; maxIteration: number}>;
  public isFetchingData$: Observable<boolean>;
  public xAxisType$: Observable<'iter' | 'timestamp' | 'iso_time'>;
  public xAxisType: 'iter' | 'timestamp' | 'iso_time';
  public isCompare: boolean;
  public isFullDetailsMode: boolean;
  public iteration: number;
  public beginningOfTime$: Observable<boolean>;
  public endOfTime$: Observable<boolean>;
  public currentPlotEvent$: Observable<any>;
  public currentPlotEvent: any;
  private iterationChanged$ = new Subject<number>();

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.previous();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.height = this.modalContainer.nativeElement.clientHeight - 80;
  }

  public chart: ExtFrame;
  public id: string;
  public darkTheme: boolean;
  public chart$: Observable<ExtFrame>;
  public plotLoaded: boolean = false;
  public beginningOfTime: boolean = false;
  public endOfTime: boolean = false;
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
  smoothWeight: any = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { chart: ExtFrame; id: string; xAxisType: any; smoothWeight; darkTheme: boolean; isCompare: boolean },
              public dialogRef: MatDialogRef<GraphViewerComponent>,
              private store: Store<any>,
              private cdr: ChangeDetectorRef
  ) {
    this.chart$ = this.store.select(selectFullScreenChart);
    this.currentPlotEvent$ = this.store.select(selectCurrentPlotViewer);
    this.xAxisType$ = this.store.select(selectFullScreenChartXtype);
    this.isFetchingData$ = this.store.select(selectFullScreenChartIsFetching);
    this.minMaxIterations$ = this.store.select(selectMinMaxIterations);
    this.beginningOfTime$ = this.store.select(selectViewerBeginningOfTime);
    this.endOfTime$ = this.store.select(selectViewerEndOfTime);
    this.store.dispatch(setXtypeGraphDisplayFullDetailsScalars({xAxisType: data.xAxisType}));
    this.store.dispatch(setGraphDisplayFullDetailsScalarsIsOpen({isOpen: true}));
    this.isCompare = data.isCompare;
    this.isFullDetailsMode = ['multiScalar', 'scalar'].includes(data.chart.layout.type) && !this.isCompare;
    this.id = data.id;
    this.darkTheme = data.darkTheme;
    const reqData = {
      task: this.data.chart.task,
      metric: this.data.chart.metric,
      variant: this.data.chart.variant,
      iteration: this.data.chart.iter
    };
    if (this.isFullDetailsMode) {
      this.store.dispatch(setGraphDisplayFullDetailsScalars({data: data.chart}));
    } else if (this.isCompare || this.darkTheme) {
      this.chart = data.chart;
      this.plotLoaded = true;
    } else {
      this.store.dispatch(getPlotSample(reqData));
    }
  }


  ngOnInit(): void {
    ////////////// SCALARS //////////////////////
    if (this.isFullDetailsMode) {
      this.store.dispatch(getGraphDisplayFullDetailsScalars({
        task: this.data.chart.data[0].task,
        metric: {metric: (this.data.chart.metric)},
      }));
    }
    this.sub.add(this.xAxisType$.subscribe((xType) => this.xAxisType = xType));

    ////////////// PLOTS //////////////////////

    this.sub.add(this.currentPlotEvent$
      .pipe(filter(plot => !!plot))
      .subscribe(currentPlotEvent => {
        this.plotLoaded = true;
        const chart = convertPlot(currentPlotEvent).plot as ExtFrame;

        if (getOr(0, 'layout.images.length', chart) > 0) {
          chart.layout.images.forEach((image: Plotly.Image) => {
              this.store.dispatch(getSignedUrl({url: image.source, config: {skipFileServer: false, skipLocalFile: false, disableCache: chart.timestamp}}));
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
        this.chart = chart;
        this.iteration = currentPlotEvent.iter;
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
      setTimeout(() => {
        this.singleGraph.drawGraph(true);
        this.cdr.detectChanges();
      }, 50);
    }
    this.height = this.modalContainer.nativeElement.clientHeight - 80;
    this.sub.add(this.chart$
      .pipe(filter(plot => !!plot))
      .subscribe(chart => {
        this.plotLoaded = true;
        this.singleGraph.shouldRefresh = true;
        this.chart = cloneDeep(chart);
        this.cdr.detectChanges();
      }));
    this.sub.add(this.iterationChanged$
      .pipe(debounceTime(100))
      .subscribe((value) => {
      const reqData = {
        task: this.chart.task,
        metric: this.chart.metric,
        variant: this.chart.variant,
        iteration: value
      };
      this.store.dispatch(getPlotSample(reqData));
    }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(setGraphDisplayFullDetailsScalarsIsOpen({isOpen: false}));
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
        metric: {metric: (this.chart.metric)},
        key: $event.value
      }));
    } else {
      this.store.dispatch(setXtypeGraphDisplayFullDetailsScalars({xAxisType: $event.value}));
    }
  }

  changeWeight(value: number) {
    this.smoothWeight = value;
  }

  refresh() {
    this.store.dispatch(getGraphDisplayFullDetailsScalars({
      task: this.chart.data[0].task,
      metric: {metric: (this.chart.metric)}
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
    if (this.canGoNext() && this.chart) {
      this.plotLoaded = false;
      this.store.dispatch(getNextPlotSample({task: this.chart.task, navigateEarlier: false}));
    }
  }

  previous() {
    if (this.canGoBack() && this.chart) {
      this.plotLoaded = false;
      this.store.dispatch(getNextPlotSample({task: this.chart.task, navigateEarlier: true}));
    }
  }

  canGoNext() {
    return !this.endOfTime && this.plotLoaded;
  }

  canGoBack() {
    return !this.beginningOfTime && this.plotLoaded;
  }
}
