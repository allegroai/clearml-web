import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {scatterPlot, miniTooltip, MousePosition, ChartSize} from 'britecharts';
import {select, Selection} from 'd3-selection';
import 'd3-zoom';
import {cloneDeep} from 'lodash-es';
import {fromEvent, Subscription} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {ProjectStatsGraphData} from '@common/core/reducers/projects.reducer';

@Component({
  selector: 'sm-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterPlotComponent implements AfterViewInit, OnDestroy {
  loading = true;
  public chartContainer: Selection<HTMLDivElement, unknown, null, undefined>;
  public tooltipContainer;
  public chartData; //: ScatterPlotDataShape;
  public chart = scatterPlot();
  public tooltip = miniTooltip();
  private initialized = false;
  private sub: Subscription;

  constructor(private readonly zone: NgZone, private cdr: ChangeDetectorRef) { }

  @ViewChild('chart') chartRef: ElementRef<HTMLDivElement>;

  @Input() colors: string[];
  @Input() set data(data: ProjectStatsGraphData[]) {
    if (data) {
      this.loading = false;
      this.chartData = cloneDeep(data);
      if (this.chartContainer) {
        if (this.initialized) {
          this.updateChart();
        } else {
          this.initChart();
        }
      }
      this.cdr.detectChanges();
    }
  }

  @Input() set showLoadingOverlay(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }
  @Output() clicked = new EventEmitter();

  ngAfterViewInit(): void {
    this.sub = fromEvent(window, 'resize')
      .pipe(throttleTime(200))
      .subscribe(() => this.onResize());
    this.chartContainer = select(this.chartRef.nativeElement);
    this.initChart();
  }

  onResize() {
    select(this.chartRef.nativeElement).selectAll('.scatter-plot').remove();
    this.chartContainer = select(this.chartRef.nativeElement);
    this.chart = scatterPlot();
    this.tooltip = miniTooltip();
    this.initialized = false;
    this.initChart();
  }

  private initChart() {
    if (this.loading || this.initialized || !this.chartContainer || !this.chartData) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.chart
        .height(this.chartContainer.node().getBoundingClientRect().height || 30)
        .width(this.chartContainer.node().getBoundingClientRect().width || 30)
        .margin({top: 10, left: 40, bottom: 40})
        .circleOpacity(0.6)
        .yTicks(3)
        // .xAxisLabel('Experiment Finish(time)')
        // .yAxisLabel('Variant')
        .grid('full')
        .yAxisLabelOffset(-40)
        .xAxisFormatType('time')
        .xAxisFormat('%x')
        .maxCircleArea(0)
        .isAnimated(false)
        .enableZoom(true)
        .on('customMouseOver', this.tooltip.show)
        .on('customMouseMove', (dataPoint: ProjectStatsGraphData, mousePos: MousePosition, chartSize: ChartSize) => {
          this.tooltip.title(dataPoint.title);
          this.tooltip.update(dataPoint, mousePos, chartSize);
        })
        .on('customMouseOut', this.tooltip.hide)
        .on('customClick', data => this.zone.run(() => this.clicked.emit(data)));

      this.updateChart();

      this.tooltip.title('Experiment');
      this.tooltipContainer = this.chartContainer.select('.scatter-plot');
      this.tooltipContainer.datum([]).call(this.tooltip);
      this.initialized = true;
    });
  }

  private updateChart() {
    if (this.colors) {
      this.chart.colorSchema(this.colors);
    }
    if (this.chartData) {
      this.chartContainer.datum(this.chartData).call(this.chart, null);
      window.setTimeout(() => this.chartContainer.selectAll('circle.data-point').attr('r', 3), 1000);
    }
    // this.chartContainer.selectAll('#scatter-clip-path').remove();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
