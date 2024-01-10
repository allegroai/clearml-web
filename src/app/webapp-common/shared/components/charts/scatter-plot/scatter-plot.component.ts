import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {ScatterPlotSeries} from '@common/core/reducers/projects.reducer';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgChartsModule} from 'ng2-charts';
import {Chart, ChartData, ChartOptions, ChartType, TooltipItem} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import {TinyColor} from '@ctrl/tinycolor';

Chart.register(zoomPlugin);


@Component({
  selector: 'sm-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressSpinnerModule,
    NgChartsModule
  ],
  standalone: true
})
export class ScatterPlotComponent implements OnChanges {
  loading = true;
  public chartData: ChartData<'scatter'>;
  public scatterChartType: ChartType = 'scatter';
  public scatterChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        grid: {
          display: true,
        },
      },
      y: {
        suggestedMin: 0,
        ticks: {
          autoSkip: true,
          stepSize: 2,
          count: 5,
        },
        grid: {
          display: true,
        },
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        borderWidth: 2,
        bodyFont: {weight: 'normal', size: 12},
        usePointStyle: true,
        boxWidth: 6,
        callbacks: {
          label: (item: TooltipItem<'scatter'>): string | string[] =>
            `${(this.chartData.datasets[item.datasetIndex].data as ScatterPlotSeries['data'])[item.dataIndex].name}`,
          afterLabel: (item: TooltipItem<'scatter'>): string | string[] =>
            `${(this.chartData.datasets[item.datasetIndex].data as ScatterPlotSeries['data'])[item.dataIndex].y}`,
          beforeLabel: (item: TooltipItem<'scatter'>): string | string[] =>
            (this.chartData.datasets[item.datasetIndex].data as ScatterPlotSeries['data'])[item.dataIndex].description,
        }
      },
      zoom: {
        pan: {
          enabled: true,
          modifierKey: 'shift'
        },
        zoom: {
          wheel: {enabled: true},
          drag: {enabled: true},
        }
      }
    }
  };
  private darkTheme: boolean;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.yAxisLabel) {
      this.scatterChartOptions.scales.y.title = {display: true, text: this.yAxisLabel};
    }
    if (changes?.xAxisLabel) {
      this.scatterChartOptions.scales.x.title = {display: true, text: this.xAxisLabel};
    }
  }

  @Input() set theme(theme: 'dark' | 'light') {
    if (theme === 'dark') {
      this.darkTheme = true;
      this.scatterChartOptions.scales.x = {ticks: {color: '#c1cdf3'}, grid: {color: '#39405f'}};
      this.scatterChartOptions.scales.y = {ticks: {color: '#c1cdf3'}, grid: {color: '#39405f'}};
      this.scatterChartOptions.plugins.tooltip = {
        ...this.scatterChartOptions.plugins.tooltip,
        backgroundColor: 'black',
        borderColor: '#8492c2',
        bodyColor: '#c3cdf0',
      }
      this.scatterChartOptions.plugins.legend.labels.color = '#c1cdf3';
    }
  }

  @Input() colors: string[];
  @Input() xAxisLabel: string;
  @Input() yAxisLabel: string;
  @Input() set data(data: ScatterPlotSeries[]) {
    if (data) {
      this.loading = false;
      this.chartData = {
        datasets: data.map(series => ({
          ...series,
          pointBackgroundColor: series.backgroundColor,
          pointBorderColor: (new TinyColor(series.backgroundColor)).lighten(20).toHex(),
          pointBorderWidth: 1,
          pointRadius: 5,
        }))
      };
      this.scatterChartOptions.plugins.legend.display = data.some(series => series.label);
    }
  }

  @Input() set showLoadingOverlay(loading: boolean) {
    this.loading = loading;
    this.cdr.detectChanges();
  }

  @Input() set xAxisType(type: 'linear' | 'logarithmic' | 'category' | 'time' | 'timeseries') {
    if (type === 'time') {
      this.scatterChartOptions.scales.x = {
        ...this.scatterChartOptions.scales.x,
        type,
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
          ...(this.darkTheme && {color: '#c1cdf3'})
        },
        time: {
          displayFormats: {
            month: 'MMM yyyy',
            day: 'dd MMM',
            hour: 'p',
            minute: 'p',
            second: 'pp'
          }
        },
      } as unknown; // ChartOptions<'scatter'>['scatter']['datasets']
    } else {
      this.scatterChartOptions.scales.x.type = type;
      this.scatterChartOptions.plugins.zoom.pan.mode = 'y';
      this.scatterChartOptions.plugins.zoom.zoom.mode = 'y';
    }
  }

  @Output() clicked = new EventEmitter();

  chartClicked(active: object[]) {
    if (active.length < 1) {
      return;
    }
    const {index, datasetIndex} = active[0] as {index: number; datasetIndex: number};
    this.clicked.emit((this.chartData.datasets[datasetIndex].data as ScatterPlotSeries['data'])[index].id);
  }
}
