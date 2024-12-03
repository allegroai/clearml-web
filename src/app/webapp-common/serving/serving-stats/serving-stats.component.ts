import {ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {servingFeature} from '@common/serving/serving.reducer';
import {ServingActions} from '@common/serving/serving.actions';
import {MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {LineChartComponent} from '@common/shared/components/charts/line-chart/line-chart.component';
import {ServingGetEndpointMetricsHistoryRequest} from '~/business-logic/model/serving/servingGetEndpointMetricsHistoryRequest';
import {interval, Subscription} from 'rxjs';
import {filter, withLatestFrom} from 'rxjs/operators';
import {selectAppVisible, selectAutoRefresh} from '@common/core/reducers/view.reducer';
import {EndpointStats} from '~/business-logic/model/serving/endpointStats';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {presetColorsDark} from '@common/shared/ui-components/inputs/color-picker/color-picker-wrapper.component';

const REFRESH_INTERVAL = 45000;

@Component({
  selector: 'sm-serving-stats',
  templateUrl: './serving-stats.component.html',
  styleUrls: ['./serving-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormField,
    MatSelect,
    FormsModule,
    MatOption,
    TooltipDirective,
    LineChartComponent
  ],
  standalone: true
})
export class ServingStatsComponent implements OnDestroy {
  private store = inject(Store);
  private colorService = inject(ColorHashService);
  private subs = new Subscription();

  public metricType = input<{ label: string; value: ServingGetEndpointMetricsHistoryRequest.MetricTypeEnum }>();
  public currentTimeFrame = input<string>();

  public allChartsData = this.store.selectSignal(servingFeature.selectStats);
  public statsError = this.store.selectSignal(servingFeature.selectShowNoStatsNotice);
  public selectedEndpoint = this.store.selectSignal(servingFeature.selectSelectedEndpoint);

  public refreshChart = signal(true);
  public yAxisLabel = signal('');

  chartData = computed(() => this.allChartsData()?.[this.metricType().value] ?? null);
  private selectedWorkerId: string | undefined;

  public presetColors = presetColorsDark;

  public yAxisLabels = {
    'cpu_usage;gpu_usage': 'Usage %',
    memory_used: 'Bytes',
    gpu_memory_used: 'Bytes',
    'network_rx;network_tx': 'Bytes/sec'
  };
  private previousEndpoint: EndpointStats;
  private previousTimeFrame: string;

  tickFormater = (value) => value;

  constructor() {
    effect(() => {
      if (this.selectedEndpoint()?.id !== this.selectedWorkerId) {
        if (this.selectedEndpoint()) {
          this.yAxisLabel.update(label => label?.[this.metricType().value]);
        }
      }
      this.selectedWorkerId = this.selectedEndpoint()?.id;
    }, {allowSignalWrites: true});

    effect(() => {
      if (!!this.currentTimeFrame() && !!this.metricType() && this.selectedEndpoint()) {
        this.yAxisLabel.set(this.yAxisLabels[this.metricType().value]);
        if (this.selectedEndpoint()?.id !== this.previousEndpoint?.id || this.currentTimeFrame() !== this.previousTimeFrame) {
          this.chartChanged();
        }
        this.previousEndpoint = this.selectedEndpoint();
        this.previousTimeFrame = this.currentTimeFrame();
      }
    }, {allowSignalWrites: true});

    effect(() => {
      if (this.chartData()) {
        this.refreshChart.set(false);
      }
    }, {allowSignalWrites: true});

    effect(() => {
      if (this.currentTimeFrame()) {
        this.autoRefreshSubscription();
      }
    });

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  chartChanged() {
    this.refreshChart.set(true);
    this.store.dispatch(ServingActions.getStats({metricType: this.metricType().value}));
  }

  autoRefreshSubscription() {
    this.subs.unsubscribe();
    this.subs = (interval(REFRESH_INTERVAL)
        .pipe(
          withLatestFrom(
            this.store.select(selectAutoRefresh),
            this.store.select(selectAppVisible)
          ),
          filter(([, auto, visible]) => auto && visible)
        )
        .subscribe(() => {
          // Many charts with many points stuck the UI. Better show loader
          if (Object.keys(this.allChartsData() ?? {}).length > 4 && parseInt(this.currentTimeFrame()) > 604000) {
            this.refreshChart.set(true);
          }
          this.store.dispatch(ServingActions.getStats({refresh: true, metricType: this.metricType().value}));
        })
    );
  }
}
