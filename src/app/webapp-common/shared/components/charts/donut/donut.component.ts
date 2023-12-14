import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {select, Selection} from 'd3-selection';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';
import donut from 'britecharts/dist/umd/donut.min';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatest, fromEvent, Subscription} from 'rxjs';
import {debounceTime, filter, startWith} from 'rxjs/operators';
import {trackById} from '@common/shared/utils/forms-track-by';

export interface DonutChartData {
  name: string;
  quantity: number;
  percentage?: number;
  id?: number;
  color?: string;
}

@Component({
  selector       : 'sm-donut',
  templateUrl       : './donut.component.html',
  styleUrls      : ['./donut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonutComponent implements OnInit, AfterViewInit, OnDestroy {

  private donutContainer: Selection<SVGElement, DonutChartData, HTMLElement, any>;
  private donutChart;
  public donutData: DonutChartData[];

  public readonly resize = new BehaviorSubject<string>(null);
  public highlight: number;
  private sub = new Subscription();
  private _colors: string[];
  trackById = trackById;

  @Input() set data(data: DonutChartData[]) {
    this.donutData = data;
    if (this.donutContainer !== undefined) {
      this.donutContainer.datum(data).call(this.donutChart);
      this.donutChart.highlightSliceById(1);
    }
  }

  @Input() set colors(colors: string[]) {
    this._colors = colors;
    if (this.donutContainer !== undefined) {
      this.donutChart.colorSchema(colors);
      if (this.donutData) {
        this.donutContainer.datum(this.donutData).call(this.donutChart);
      }
    }
  }

  get colors(): string[] {
    return this._colors;
  }

  constructor(
    private store: Store,
    private colorHash: ColorHashService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.donutChart = donut();
    this.donutContainer = select('.donut-container');

    this.sub.add(combineLatest([
      this.resize,
      fromEvent(window, 'resize').pipe(startWith(null))
    ])
      .pipe(
        filter(source => source !== null),
        debounceTime(50)
      )
      .subscribe(() => this.onResize()));
  }

  ngAfterViewInit(): void {
    this.initDonutChart();
    this.donutChart.highlightSliceById(1);
  }

  initDonutChart() {
    const {width, height} = this.donutContainer.node().getBoundingClientRect();
    const length = Math.min(width, height);
    this.donutChart
      .width(width)
      .height(height)
      .externalRadius(length / 2.5)
      .internalRadius(length / 5)
      .on('customMouseOver', (data) => {
        this.highlight = data.data.id;
        this.cdr.detectChanges();
      })
      .on('customMouseOut', () => {
        this.highlight = null;
        this.cdr.detectChanges();
      });
  }

  onResize() {
    this.donutContainer.select('svg').remove();
    this.donutChart     = donut();
    this._colors && this.donutChart.colorSchema(this._colors);
    this.initDonutChart();
    if (this.donutData) {
      this.donutContainer.datum(this.donutData).call(this.donutChart);
      this.donutChart.highlightSliceById(1);
    }
  }

  hoverLegend(slice: DonutChartData) {
    this.donutChart.highlightSliceById(slice.id);
    this.donutContainer.datum(this.donutData).call(this.donutChart);
    this.highlight = slice.id;
  }

  leaveLegend(slice: DonutChartData) {
    if (this.donutChart.highlightSliceById() === slice.id) {
      this.donutChart.highlightSliceById(null);
      this.donutContainer.datum(this.donutData).call(this.donutChart);
    }
    this.highlight = null;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
