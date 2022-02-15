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
import {Store} from "@ngrx/store";
import {
  getGraphDisplayFullDetailsScalars,
  setGraphDisplayFullDetailsScalars,
  setGraphDisplayFullDetailsScalarsIsOpen,
  setXtypeGraphDisplayFullDetailsScalars
} from '../../../experiments/actions/common-experiment-output.actions';
import {Observable} from 'rxjs/internal/Observable';
import {Subscription} from 'rxjs';
import {cloneDeep} from 'lodash/fp';
import {
  selectFullScreenChart,
  selectFullScreenChartIsFetching,
  selectFullScreenChartXtype
} from '../../../experiments/reducers';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'sm-graph-displayer',
  templateUrl: './graph-displayer.component.html',
  styleUrls: ['./graph-displayer.component.scss']
})
export class GraphDisplayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('singleGraph') singleGraph;
  @ViewChild('modalContainer') modalContainer;
  height;
  public isFetchingData$: Observable<boolean>;
  public xAxisType$: Observable<"iter" | "timestamp" | "iso_time">;
  public xAxisType: "iter" | "timestamp" | "iso_time";
  private xtypeSub: Subscription;
  public isCompare: boolean;
  public isFullDetailsMode: boolean;

  @HostListener('window:resize')
  onResize() {
    this.height = this.modalContainer.nativeElement.clientHeight - 80;
    setTimeout(this.singleGraph.drawGraph(true), 0);
  }

  public chart: ExtFrame;
  public id: string;
  public darkTheme: boolean;
  public chart$: Observable<ExtFrame>;
  private chartSub: Subscription;
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { chart: ExtFrame; id: string; xAxisType: any; smoothWeight; darkTheme: boolean; isCompare: boolean},
              public dialogRef: MatDialogRef<GraphDisplayerComponent>,
              private store: Store<any>,
              private cdr: ChangeDetectorRef
  ) {
    this.chart$ = this.store.select(selectFullScreenChart);
    this.xAxisType$ = this.store.select(selectFullScreenChartXtype);
    this.isFetchingData$ = this.store.select(selectFullScreenChartIsFetching);
    this.store.dispatch(setXtypeGraphDisplayFullDetailsScalars({xAxisType: data.xAxisType}));
    this.store.dispatch(setGraphDisplayFullDetailsScalars({data: data.chart}));
    this.store.dispatch(setGraphDisplayFullDetailsScalarsIsOpen({isOpen: true}));
    this.chart = data.chart;
    this.isCompare = data.isCompare;
    this.isFullDetailsMode = ['multiScalar', 'scalar'].includes(this.chart.layout.type) && !this.isCompare;
    this.id = data.id;
    this.darkTheme = data.darkTheme;
  }


  ngOnInit(): void {
    if (this.isFullDetailsMode) {
      this.store.dispatch(getGraphDisplayFullDetailsScalars({
        task: this.chart.data[0].task,
        metric: {metric: (this.chart.metric) },
      }));
    }
    this.xtypeSub = this.xAxisType$.subscribe((xType) => this.xAxisType = xType);
  }

  ngAfterViewInit(): void {
    this.height = this.modalContainer.nativeElement.clientHeight - 80;
    this.chartSub = this.chart$.subscribe(chart => {
      this.singleGraph.shouldRefresh = true;
      this.chart = cloneDeep(chart);
      if (this.chart) {
        this.cdr.detectChanges();
        setTimeout(this.singleGraph.drawGraph(true), 0);
      }
    });
  }

  closeGraphDisplayer() {
    this.dialogRef.close();
  }

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

  ngOnDestroy(): void {
    this.store.dispatch(setGraphDisplayFullDetailsScalarsIsOpen({isOpen: false}));
    this.chartSub.unsubscribe();
    this.xtypeSub.unsubscribe();
  }

  refresh() {
    this.store.dispatch(getGraphDisplayFullDetailsScalars({
      task: this.chart.data[0].task,
      metric: {metric: (this.chart.metric) }
    }));
  }
}
