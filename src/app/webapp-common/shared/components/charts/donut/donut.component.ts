import {Component, OnInit, Input, ChangeDetectionStrategy} from '@angular/core';
import {select, selectAll, Selection} from 'd3-selection';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';
import donut from 'britecharts/dist/umd/donut.min';
import legend from 'britecharts/dist/umd/legend.min';
import {attachColorChooser} from '../../../ui-components/directives/choose-color/choose-color.directive';
import {Store} from '@ngrx/store';

export interface DonutChartData {
  name: string;
  quantity: number;
  percentage?: number;
  id?: number;
}

@Component({
  selector       : 'sm-donut',
  template       : `<div #drawHere></div>
<div class="row" (window:resize)="onResize()">
  <div class="col-md-10 col-sm-12 donut-legend"></div>
  <div class="col-md-14 col-sm-12 donut-container"></div>
</div>`,
  styleUrls      : ['./donut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonutComponent implements OnInit {

  private donutContainer: Selection<SVGElement, {}, HTMLElement, any>;
  private donutChart;
  private donutData: DonutChartData[];

  private legendContainer: Selection<SVGElement, {}, HTMLElement, any>;
  private legendChart;
  private legendWidth: number;

  @Input() set data(data: DonutChartData[]) {
    this.donutData = data;
    if (this.donutContainer !== undefined) {
      this.donutContainer.datum(data).call(this.donutChart);
      this.updateLegend();
    }
  }

  @Input() set colors(colors: string[]) {
    if (this.donutContainer !== undefined) {
      this.donutChart.colorSchema(colors);
      this.legendChart.colorSchema(colors);
      if (this.donutData) {
        this.donutContainer.datum(this.donutData).call(this.donutChart);
        this.updateLegend();
      }
    }
  }

  constructor(private colorHash: ColorHashService, private store: Store<any>) {}

  ngOnInit() {
    this.legendChart     = legend();
    this.legendContainer = select('.donut-legend');

    this.initLegendChart();
    this.donutChart     = donut();
    this.donutContainer = select('.donut-container');
    this.initDonutChart();
  }

  initLegendChart() {
    const rect       = this.legendContainer.node().getBoundingClientRect();
    const {width}    = rect;
    this.legendWidth = width * 0.8;

    if (rect) {
      this.legendChart
        .width(this.legendWidth)
        .numberFormat('l');
    }
  }

  updateLegend() {
    this.legendChart.height(30 + this.donutData?.length * 20);
    this.legendContainer.datum(this.donutData).call(this.legendChart);
    selectAll('.legend-entry').nodes().forEach((node: HTMLElement) => {
      const text   = node.querySelector('.legend-entry-name').textContent;
      const circle = node.querySelector('.legend-circle');
      attachColorChooser(text, circle, this.colorHash, this.store);
    });

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
      .text((d: DonutChartData) => d.name);
  }

  initDonutChart() {
    const containerWidth = this.donutContainer.node() ? this.donutContainer.node().getBoundingClientRect().width : 10;
    this.donutChart
      .width(containerWidth)
      .height(containerWidth)
      .externalRadius(containerWidth / 2.5)
      .internalRadius(containerWidth / 5)
      .on('customMouseOver', (data) => {
        this.legendChart.highlight(data.data.id);
      })
      .on('customMouseOut', () => {
        this.legendChart.clearHighlight();
      });
  }

  onResize() {
    this.initLegendChart();
    this.initDonutChart();
    if (this.donutData) {
      this.donutContainer.datum(this.donutData).call(this.donutChart);
      this.updateLegend();
    }
  }
}
