import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {BaseChartDirective, NgChartsModule} from 'ng2-charts';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {
  ChartData,
  ChartOptions,
  ChartType,
  Plugin
} from 'chart.js';
import 'chartjs-adapter-date-fns';


declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    hoverLine?: {
      color?: string;
      dash?: [number, number];
      width?: number;
      drawY?: boolean;
    }
  }
}


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

export interface concatLatestFrom {
  dataByTopic?: Topic[];
}

@Component({
  selector       : 'sm-line-chart',
  templateUrl    : './line-chart.component.html',
  styleUrls      : ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgChartsModule,
    MatProgressSpinnerModule
  ]
})
export class LineChartComponent {

  public loading     = false;
  public chartData: ChartData<'line', Topic['dates']>;

  public lineChartOptions: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    layout: {
      padding: {top: 12, bottom: 12}
    },
    elements: {
      line: {
        tension: 0.5,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        type: 'time',
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
          color: '#c1cdf3',
        },
        time: {
          tooltipFormat: 'P pp',
          displayFormats: {
            month: 'MMM yyyy',
            day: 'dd MMM',
            hour: 'E p',
            minute: 'p',
            second: 'pp'
          }
        },
      },
      y: {
        position: 'left',
        suggestedMin: 0,
        ticks: {
          autoSkip: true,
          stepSize: 2,
          count: 5,
          color: '#c1cdf3',
        },
        grid: {
          display: true,
          color: '#39405f',
        }
      },
    },

    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#dce0ee',
          font: {weight: 'normal', size: 12},
          padding: 20,
          usePointStyle: true,
        }

      },
      tooltip: {
        backgroundColor: '#1a1e2c',
        borderWidth: 1,
        borderColor: '#8492c2',
        bodyColor: '#c3cdf0',
        bodyFont: {weight: 'normal', size: 12},
        padding: 12,
        usePointStyle: true,
      },
      hoverLine: {
        dash: [6, 6],
        color: '#8492c2',
        width: 1,
      }
    },

    parsing: {
      xAxisKey: 'date',
      yAxisKey: 'value'
    }
  };

  lineChartPlugins: Plugin<'line'>[] =  [{
    id: 'hoverLine',
    afterDatasetsDraw: (chart, _, opts) => {
      const {
        ctx,
        tooltip,
        chartArea: { top, bottom}
      } = chart;

      if (tooltip.opacity) {
        ctx.lineWidth = opts.width || 0;
        ctx.setLineDash(opts.dash || []);
        ctx.strokeStyle = opts.color || 'black';

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tooltip.caretX, bottom);
        ctx.lineTo(tooltip.caretX, top);
        ctx.stroke();
        ctx.closePath();
        ctx.setLineDash([]);
      }
    }
  }];
  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  @Input() yTickFormatter: (number) => number;

  @Input() set yLabel(label: string) {
    this.lineChartOptions.scales.y.title = {display: !!label, text: label, color: '#c1cdf3'};
  }

  @Input() set showLoadingOverlay(show: boolean) {
    if (!show) {
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else {
      this.loading  = true;
    }
  }

  @Input() set data(topics: Topic[]) {
    if (topics && !(topics?.length > 0)) {
      this.chartData = undefined;
      return;
    }

    if (this.chartData?.datasets?.length > 0) {
      const topicsLabels = topics?.map(topic => topic.topicName) ?? [];
      for(let i = 0; i < this.chartData.datasets.length; i++) {
        if (!topicsLabels.includes(this.chartData.datasets[i].label)) {
          this.chartData.datasets.splice(i, 1);
          i--;
        }
      }
      topics?.forEach((topic) => {
        const index = this.chartData.datasets.findIndex(ds => ds.label === topic.topicName);
        if (index > -1) {
          this.chartData.datasets[index].data = topic.dates;
        } else {
          this.chartData.datasets.push(this.createDataset(topic, this.chartData.datasets.length));
        }
      });
      this.chart?.update();
    } else {
      this.chartData = {
        datasets: topics?.map((topic, index) => this.createDataset(topic, index)),
      };
    }
  }

  private createDataset(topic: Topic, index: number) {
    return {
      data: topic.dates,
      label: topic.topicName,
      pointRadius: 0,
      pointBorderColor: '#1a1e2c',
      borderWidth: 2,
      pointBackgroundColor: this.colorScheme[index % this.colorScheme.length],
      borderColor: this.colorScheme[index % this.colorScheme.length],
      backgroundColor: this.colorScheme[index % this.colorScheme.length]
    };
  }

  @Input() colorScheme= ['#a4a1fb', '#ff8a15'];

  constructor(private cdr: ChangeDetectorRef) {
  }
}
