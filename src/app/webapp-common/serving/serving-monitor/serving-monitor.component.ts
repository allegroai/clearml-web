import {ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild} from '@angular/core';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {
  SelectableFilterListComponent
} from '@common/shared/ui-components/data/selectable-filter-list/selectable-filter-list.component';
import {Store} from '@ngrx/store';
import {AngularSplitModule} from 'angular-split';
import {ServingStatsComponent} from '@common/serving/serving-stats/serving-stats.component';
import {timeFrameOptions} from '@common/constants';
import {MatFormField} from '@angular/material/form-field';
import {MatOption} from '@angular/material/autocomplete';
import {MatSelect} from '@angular/material/select';
import {servingFeature} from '@common/serving/serving.reducer';
import {FormsModule} from '@angular/forms';
import {ServingActions} from '@common/serving/serving.actions';
import {
  ServingGetEndpointMetricsHistoryRequest
} from '~/business-logic/model/serving/servingGetEndpointMetricsHistoryRequest';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import MetricTypeEnum = ServingGetEndpointMetricsHistoryRequest.MetricTypeEnum;

@Component({
  selector: 'sm-serving-monitor',
  templateUrl: './serving-monitor.component.html',
  styleUrl: './serving-monitor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDrawerContent,
    SelectableFilterListComponent,
    MatDrawerContainer,
    MatDrawer,
    AngularSplitModule,
    ServingStatsComponent,
    MatFormField,
    MatOption,
    MatSelect,
    FormsModule,
    TooltipDirective,
    MatButton,
    MatIcon,
    MatIconButton
  ],
})
export class ServingMonitorComponent {
  private store = inject(Store);

  private charts = viewChild<ElementRef<HTMLDivElement>>('charts');
  public searchTerm = signal('');
  public currentTimeFrame = this.store.selectSignal<string>(servingFeature.selectStatsTimeFrame);
  public hiddenCharts = this.store.selectSignal(servingFeature.selectHiddenCharts);
  public selectedCharts = computed(() =>
    this.chartParamOptions.map(name => name.label).filter(metric => !this.hiddenCharts().includes(metric))
  );

  timeFrameOptions = timeFrameOptions;
  public chartParamOptions: { label: string; value: MetricTypeEnum }[] = [
    {label: 'NUMBER OF REQUESTS', value: MetricTypeEnum.Requests},
    {label: 'REQUESTS PER MINUTE', value: MetricTypeEnum.RequestsMin},
    {label: 'AVERAGE LATENCY (ms)', value: MetricTypeEnum.LatencyMs},
    {label: 'CPU COUNT', value: MetricTypeEnum.CpuCount},
    {label: 'GPU COUNT', value: MetricTypeEnum.GpuCount},
    {label: 'AVERAGE CPU LOAD (%)', value: MetricTypeEnum.CpuUtil},
    {label: 'AVERAGE GPU UTILIZATION (%)', value: MetricTypeEnum.GpuUtil},
    {label: 'MEMORY USAGE (GB)', value: MetricTypeEnum.RamTotal},
    {label: 'MEMORY FREE (GB)', value: MetricTypeEnum.RamFree},
    {label: 'VIDEO MEMORY USAGE (GB)', value: MetricTypeEnum.GpuRamTotal},
    {label: 'VIDEO MEMORY FREE (GB)', value: MetricTypeEnum.GpuRamFree},
    {label: 'NETWORK THROUGHPUT RX (MBps)', value: MetricTypeEnum.NetworkRx},
    {label: 'NETWORK THROUGHPUT TX (MBps)', value: MetricTypeEnum.NetworkTx}
  ];

  chartsList: SelectableListItem[] = this.chartParamOptions.map(option => ({name: option.label, value: option.label}));

  searchTermChanged(searchTerm: string) {
    this.searchTerm.set(searchTerm);
  }

  metricSelected(id: string) {
    const element = this.charts().nativeElement.getElementsByClassName(id)?.[0] as HTMLDivElement;
    if (element) {
      this.charts().nativeElement.scrollTo({top: element.offsetTop - 60, behavior: 'smooth'});
    } else {
      this.charts().nativeElement.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  selectedMetricListChanged(selectedList: string[]) {
    this.store.dispatch(ServingActions.setChartHidden({
      // hiddenList: selectedList as MetricTypeEnum[]
    hiddenList: this.chartParamOptions.map(name => name.label).filter(metric => !selectedList.includes(metric)) as MetricTypeEnum[]
    }));
  }

  timeFrameChange(event) {
    this.store.dispatch(ServingActions.setStatsTimeframe({timeFrame: event}));
  }
}
