import {
  Component,
  Input,
  ChangeDetectionStrategy, ViewChild,
} from '@angular/core';
import {trackById} from '@common/shared/utils/forms-track-by';
import {ChartData, ChartEvent, ChartOptions, ChartType} from 'chart.js';
import {BaseChartDirective, NgChartsModule} from 'ng2-charts';
import {NgForOf} from '@angular/common';
import {ChooseColorModule} from '@common/shared/ui-components/directives/choose-color/choose-color.module';

export interface DonutChartData {
  name: string;
  quantity: number;
  percentage?: number;
  id?: number;
  color?: string;
}

@Component({
  selector: 'sm-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgChartsModule,
    NgForOf,
    ChooseColorModule,
  ],
  standalone: true
})
export class DonutComponent {

  public donutData: ChartData<'doughnut'>;
  trackById = trackById;
  public doughnutChartType: ChartType = 'doughnut';
  public percent: number = null;
  private total: number;
  private _colors: string[];

  highlight: number = null;
  donutOptions = {
    maintainAspectRatio: false,
    borderWidth: 0,
    plugins: {
      legend: {display: false}
    }
  } as ChartOptions<'doughnut'>;

  @Input() set data(data: DonutChartData[]) {
    this.donutData = {
      labels: data.map(slice => slice.name),
      datasets: [{
        data: data.map(slice => slice.quantity),
        backgroundColor: this.colors,
      }]
    };
    this.total = data.reduce((acc, slice) => acc + slice.quantity, 0)
  }

  get colors(): string[] {
    return this._colors;
  }

  @Input() set colors(colors: string[]) {
    this._colors = colors;
    if (this.donutData) {
      this.donutData = {...this.donutData, datasets: [{...this.donutData.datasets[0], backgroundColor: colors}]};
      this.chart?.update();
    }
  }

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public chartHovered({ active }: { event: ChartEvent; active: object[]; }): void {
    this.highlight = (active?.[0] as {datasetIndex: number; index: number})?.index ?? null;
    this.calcPercent();
  }

  private calcPercent() {
    if (this.highlight !== null) {
      this.percent = Math.round(this.donutData.datasets[0].data[this.highlight] / this.total * 100);
    } else {
      this.percent = null;
    }
  }

  hoverLegend(slice) {
    this.highlight = slice;
    this.calcPercent();
  }

  leaveLegend() {
    this.highlight = null;
    this.calcPercent();
  }

  resize() {
    this.chart.update(30);
  }
}
