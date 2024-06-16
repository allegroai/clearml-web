import {Component, ChangeDetectionStrategy, signal, effect, input, computed, viewChild} from '@angular/core';
import {ChartData, ChartEvent, ChartOptions, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

import {ChooseColorModule} from '@common/shared/ui-components/directives/choose-color/choose-color.module';
import {toSignal} from '@angular/core/rxjs-interop';
import {fromEvent} from 'rxjs';

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
  standalone: true,
  imports: [
    BaseChartDirective,
    ChooseColorModule
  ],
})
export class DonutComponent {
  public doughnutChartType: ChartType = 'doughnut';
  private windowResize = toSignal(fromEvent(window, 'resize'));
  protected resizing = signal(false);
  private chart = viewChild(BaseChartDirective);

  highlight = signal<number>(null);
  donutOptions = {
    maintainAspectRatio: false,
    borderWidth: 0,
    plugins: {
      legend: {display: false}
    }
  } as ChartOptions<'doughnut'>;

  data = input.required<DonutChartData[]>();
  colors = input<string[]>();
  resize = input<number>();
  protected donutData = computed<ChartData<'doughnut'>>(() => ({
      labels: this.data().map(slice => slice.name),
      datasets: [{
        data: this.data().map(slice => slice.quantity),
        backgroundColor: this.colors(),
      }]
    })
  );
  protected total = computed(() =>
    this.data().reduce((acc, slice) => acc + slice.quantity, 0)
  );
  protected percent = computed(() => {
    if (this.highlight() !== null) {
      return  Math.round(this.donutData().datasets[0].data[this.highlight()] / this.total() * 100);
    } else {
      return null;
    }
  });

  constructor() {
    let setTimer: number = 0;
    effect(() => {
      this.windowResize();
      this.resize();
      this.resizing.set(true);
      window.clearTimeout(setTimer);
      setTimer = window.setTimeout(() => {
        this.resizing.set(false);
      }, 100);
    }, {allowSignalWrites: true});

    effect(() => {
      if (this.chart()) {
        window.setTimeout(() => this.chart().update(), 50)
      }
    });
  }

  public chartHovered({ active }: { event: ChartEvent; active: object[]; }): void {
    this.highlight.set((active?.[0] as {datasetIndex: number; index: number})?.index ?? null);
  }

  hoverLegend(slice: number) {
    this.highlight.set(slice);
  }

  leaveLegend() {
    this.highlight.set(null);
  }
}
