import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  NgZone, ElementRef, OnDestroy,
} from '@angular/core';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {Store} from '@ngrx/store';
import {line, tooltip, legend, LegendModule} from 'britecharts';
import {select, Selection} from 'd3-selection';
import 'd3-transition';
import {LineChartModule} from 'britecharts/src/typings/charts/line-chart';
import {TimeSeriesChartAPI} from 'britecharts/src/typings/common/base';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

interface Topic {
  topicName: string;
  topic: number;
  dates: { value: number; date: string }[];
}

export interface LineChartFlatData {
  topicName: string;
  name: string;
  originalDate: number;
  date: string;
  value: number;
}

export interface LineChartData {
  dataByTopic?: Topic[];
  data: LineChartFlatData[];
}

@Component({
  selector       : 'sm-line-chart',
  templateUrl    : './line-chart.component.html',
  styleUrls      : ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements AfterViewInit, OnDestroy {

  private lineMargin = {top: 30, bottom: 50, left: 80, right: 10};
  private lineChartContainer: Selection<Element, LineChartData, Element, LineChartFlatData>;
  private lineChart: LineChartModule;
  private lineTooltipContainer;
  private lineTooltip;
  private legendContainer: Selection<Element, LineChartData, Element, {id: number; name: string}>;
  private legendChart: LegendModule;
  private legendWidth: number;
  public loading     = false;
  private _yLabel: string;
  public chartData: LineChartData;
  private initDone   = false;
  private hidden = {} as {[id: string]: boolean}
  private hiddenIndexes = {} as {[id: number]: boolean}

  @Input() yTickFormatter: (number) => number;
  private sub = new Subscription();
  private scale: number;

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
    if (data && !(data?.data?.length > 0) && (data.dataByTopic?.length === 0 || data.dataByTopic?.every(topic => topic.dates.length === 0))) {
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
  @Input() colorScheme = ['#a4a1fb', '#ff8a15'];

  @ViewChild('chart') chartRef: ElementRef<HTMLDivElement>;
  @ViewChild('legend') legendRef: ElementRef<HTMLDivElement>;

  constructor(private cdr: ChangeDetectorRef, private readonly zone: NgZone, private store: Store) {
    this.sub.add(this.store.select(selectScaleFactor)
      .pipe(map(factor => 100 / factor))
      .subscribe(scale => this.scale = scale)
    );
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.legendChart = legend();
      this.legendContainer = select(this.legendRef.nativeElement);
      this.lineChart = line();
      this.lineTooltip = tooltip();
      this.lineChartContainer = select(this.chartRef.nativeElement);
    });
    if (!this.loading) {
      setTimeout(this.initLineChart.bind(this));
    }
  }

  initLegend() {
    this.zone.runOutsideAngular(() => {
      const rect = this.legendContainer.node().getBoundingClientRect();
      const {width} = rect;
      this.legendWidth = width;

      if (rect) {
        this.legendChart
          .width(this.legendWidth)
          .height(40)
          .colorSchema(this.colorScheme)
          .numberFormat('l')
          .isHorizontal(true)
      }
    });
  }

  toggleSeries({id, name}: {id: number; name: string}) {
    this.hidden[name] = !this.hidden[name];
    this.hiddenIndexes[id] = !this.hiddenIndexes[id];
    this.onResize();
  }

  updateLegend() {
    if (!this.chartData) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const data = this.chartData.dataByTopic ?
        this.chartData.dataByTopic.map(topic => ({id: topic.topic, name: topic.topicName})) :
        this.chartData.data.reduce((acc, d) => {
          !acc.find(entry => entry.name === d.topicName) && acc.push({name: d.topicName, id: acc.length});
          return acc;
        },  [])

      this.legendContainer.datum(data).call(this.legendChart, []);

      this.legendContainer.select('defs').remove();
      this.legendContainer.selectAll('.legend-entry')
        .style('cursor', 'pointer')
        .on('click', (event, data: {id: number; name: string}) => this.toggleSeries(data));

      this.legendContainer.selectAll('.legend-circle')
        .classed('circle-hidden', (data: {name: string}) => this.hidden[data.name])

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
        .text((d) => d['name']);
    });
  }

  initLineChart() {
    this.zone.runOutsideAngular(() => {
      const containerWidth: number = this.lineChartContainer.node() ?
        this.lineChartContainer.node().getBoundingClientRect().width / this.scale : 10;

      this.lineChart
        .tooltipThreshold(600)
        .height(this.chartRef.nativeElement.getBoundingClientRect().height)
        .margin(this.lineMargin)
        .lineCurve('monotoneX')
        .isAnimated(true)
        .grid('horizontal')
        .width(containerWidth)
        .colorSchema(this.colorScheme)
        .lineGradient([this.colorScheme[0], this.colorScheme[0]])
        .xAxisLabel('')
        .xTicks(2)
        .yAxisLabelPadding(50)
        .yAxisLabel(this._yLabel)
        .xAxisFormat('custom' as unknown as TimeSeriesChartAPI<number>['axisTimeCombinations'])
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
      const tooltipElm          = this.chartRef.nativeElement;
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
        const firstColorNotHidden = this.colorScheme.find( (color, i) => !this.hiddenIndexes[i]);
        this.lineChartContainer.selectAll('#one-line-gradient-1 stop').attr('stop-color', firstColorNotHidden);
        const chartData  = {
          ...this.chartData,
          data: this.chartData?.data?.filter(d => !this.hidden?.[d.topicName]),
          dataByTopic: this.chartData?.dataByTopic?.filter(t => !this.hidden?.[t.topicName])
        } as LineChartData;
        this.lineChartContainer.selectAll('.chart-group .topic').remove();
        this.lineChartContainer.datum(chartData).call(this.lineChart, undefined);
        this.lineChartContainer.selectAll('.chart-group .topic path').attr('stroke', (base: Topic)=> this.colorScheme[base.topic - 1]);
        if (this.yTickFormatter) {
          this.lineChartContainer.selectAll('.y.axis .tick text').text(this.yTickFormatter);
        }
      });
    }
  }

  getXAxisFormatter(data: LineChartData) {
    if (!data) {
      return null;
    }
    const dates = data.dataByTopic?.[0].dates.map(d => d.date) ?? data.data.map(d => d.originalDate);
    const firstDate  = new Date(dates[0]);
    const lastDate  = new Date(dates.at(-1));
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
