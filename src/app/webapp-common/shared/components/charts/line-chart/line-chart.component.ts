import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import line from 'britecharts/dist/umd/line.min';
import tooltip from 'britecharts/dist/umd/tooltip.min';
import legend from 'britecharts/dist/umd/legend.min';
import {select, Selection} from 'd3-selection';

interface Topic {
  topicName: string;
  topic: number;
  dates: { value: number; date: string }[];
}

export interface LineChartData {
  dataByTopic?: Topic[];
}

const COLOR_SCHEME = ['#a4a1fb', '#ff8a15'];

@Component({
  selector       : 'sm-line-chart',
  templateUrl    : './line-chart.component.html',
  styleUrls      : ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements AfterViewInit {

  private lineMargin = {top: 30, bottom: 50, left: 80, right: 10};
  private lineChartContainer: Selection<SVGElement, LineChartData, HTMLElement, any>;
  private lineChart;
  private lineTooltipContainer;
  private lineTooltip;
  private legendContainer: Selection<SVGElement, LineChartData, HTMLElement, any>;
  private legendChart;
  private legendWidth: number;
  public loading     = false;
  private _yLabel: string;
  public chartData: LineChartData;
  private initDone   = false;

  @Input() yTickFormatter: (number) => number;

  @Input() set yLabel(label: string) {
    this._yLabel = label;
    if (this.initDone) {
      this.lineChart.yAxisLabel(label);
    }
  }

  @Input() set showLoadingOverlay(show: boolean) {
    if (!show) {
      setTimeout(() => {
        this.initLineChart();
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else {
      this.loading  = true;
      this.initDone = false;
    }
  }

  @Input() tooltipVerticalOffset = -100;

  @Input() set data(data: LineChartData) {
    if (data && (data.dataByTopic.length === 0 || data.dataByTopic.every(topic => topic.dates.length === 0))) {
      this.chartData = undefined;
      return;
    }

    this.chartData = data;
    if (this.initDone) {
      this.lineChart.xAxisCustomFormat(this.getXAxisFormatter(this.chartData))
        .isAnimated(false);
      this.updateChart();
      this.updateLegend();
    }
  }

  @ViewChild('chart', {read: ViewContainerRef, static: true}) chartRef: ViewContainerRef;
  @ViewChild('legend', {read: ViewContainerRef, static: true}) legendRef: ViewContainerRef;

  constructor(private cdr: ChangeDetectorRef, private readonly zone: NgZone) {
  }

  ngAfterViewInit() {
    this.legendChart        = legend();
    this.legendContainer    = select(this.legendRef.element.nativeElement);
    this.lineChart          = line();
    this.lineTooltip        = tooltip();
    this.lineChartContainer = select(this.chartRef.element.nativeElement);
    if (!this.loading) {
      setTimeout(this.initLineChart.bind(this));
    }
  }

  initLegend() {
    const rect       = this.legendContainer.node().getBoundingClientRect();
    const {width}    = rect;
    this.legendWidth = width;

    if (rect) {
      this.legendChart
        .width(this.legendWidth)
        .height(40)
        .colorSchema(COLOR_SCHEME)
        .numberFormat('l')
        .isHorizontal(true);
    }
  }

  updateLegend() {
    if (!this.chartData) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const data = this.chartData.dataByTopic.map(topic => ({id: topic.topic, name: topic.topicName}));
      this.legendContainer.datum(data).call(this.legendChart);

      this.legendContainer.select('defs').remove();
      this.legendContainer.select('svg').append('defs').append('svg:clipPath')
        .attr('id', 'legend-label-clip')
        .append('svg:rect')
        .attr('id', 'clip-rect')
        .attr('x', '0')
        .attr('y', '-10')
        .attr('width', this.legendWidth - 100)
        .attr('height', 20);
      this.legendContainer.selectAll('.legend-entry-name')
        .attr('clip-path', 'url(#legend-label-clip)')
        .append('title')
        .text((d: any[]) => d['name']);
    });
  }

  initLineChart() {
    this.zone.runOutsideAngular(() => {
      const containerWidth: number = this.lineChartContainer.node() ?
        this.lineChartContainer.node().getBoundingClientRect().width : 10;

      this.lineChart
        .tooltipThreshold(600)
        .height(270)
        .margin(this.lineMargin)
        .lineCurve('monotoneX')
        .isAnimated(true)
        .grid('horizontal')
        .width(containerWidth)
        .colorSchema(COLOR_SCHEME)
        .lineGradient(['#a4a1fb', '#a4a1fb'])
        .xAxisLabel('')
        .xTicks(8)
        .yAxisLabelPadding(50)
        .yAxisLabel(this._yLabel)
        .xAxisFormat(this.lineChart.axisTimeCombinations.CUSTOM)
        .on('customMouseOver', this.lineTooltip.show)
        .on('customMouseMove', this.lineTooltip.update)
        .on('customMouseOut', this.lineTooltip.hide);

      this.initLegend();

      if (this.chartData) {
        this.lineChart.xAxisCustomFormat(this.getXAxisFormatter(this.chartData));
        this.updateChart();
        this.updateLegend();
      }

      // Tooltip Setup and start
      const tooltipElm          = this.chartRef.element.nativeElement;
      this.lineTooltipContainer = select(tooltipElm).select('.metadata-group .vertical-marker-container');
      this.lineTooltip
        .title('')
        .valueLabel('value')
        .dateFormat(this.lineTooltip.axisTimeCombinations.CUSTOM)
        .dateCustomFormat('%c')
        .tooltipOffset({
          y: this.tooltipVerticalOffset,
          x: 500
        });

      if (this.yTickFormatter) {
        this.lineTooltip.valueFormatter(this.yTickFormatter);
      }
      // Note that if the viewport width is less than the tooltipThreshold value,
      // this container won't exist, and the tooltip won't show up
      this.lineTooltipContainer.datum([]).call(this.lineTooltip);
      this.initDone = true;
    });
  }

  updateChart() {
    if (this.chartData) {
      this.zone.runOutsideAngular(() => {
        this.lineChartContainer.datum(this.chartData).call(this.lineChart);
        if (this.yTickFormatter) {
          this.lineChartContainer.selectAll('.y.axis .tick text').text(this.yTickFormatter);
        }
      });
    }
  }

  getXAxisFormatter(data) {
    if (!data) {
      return;
    }
    data               = data.dataByTopic[0].dates;
    const firstDate    = new Date(data[0].date);
    const lastDate     = new Date(data[data.length - 1].date);
    const dateTimeSpan = lastDate.getTime() - firstDate.getTime();

    if (dateTimeSpan > 3 * 24 * 60 * 60 * 1000) { // more then 3 days
      this.lineChart.xTicks(6);
      return '%b %d';
    } else if (dateTimeSpan > 4 * 60 * 60 * 1000) { // more then 4 hours
      this.lineChart.xTicks(5);
      return '%a %I%p';
    }
    this.lineChart.xTicks(8);
    return '%H:%M';
  }

  onResize() {
    this.initLegend();
    const containerWidth: number = this.lineChartContainer.node() ?
      this.lineChartContainer.node().getBoundingClientRect().width : 10;
    this.lineChart.width(containerWidth)
      .isAnimated(false);
    this.updateChart();
    this.updateLegend();
  }
}
