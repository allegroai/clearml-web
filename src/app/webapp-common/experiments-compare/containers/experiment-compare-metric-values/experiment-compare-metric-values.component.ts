import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {combineLatestWith, distinctUntilChanged, distinctUntilKeyChanged, filter, map, take, tap, throttleTime} from 'rxjs/operators';
import {isEqual, mergeWith} from 'lodash-es';
import {fromEvent, Observable, startWith, Subscription} from 'rxjs';
import * as metricsValuesActions from '../../actions/experiments-compare-metrics-values.actions';
import {selectCompareMetricsValuesExperiments, selectExportTable, selectSelectedExperimentSettings, selectShowRowExtremes} from '../../reducers';
import {ActivatedRoute} from '@angular/router';
import {RefreshService} from '@common/core/services/refresh.service';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {Task} from '~/business-logic/model/tasks/task';
import {FormControl} from '@angular/forms';
import {setExperimentSettings, setSelectedExperiments} from '@common/experiments-compare/actions/experiments-compare-charts.actions';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {rgbList2Hex} from '@common/shared/services/color-hash/color-hash.utils';
import {trackById} from '@common/shared/utils/forms-track-by';
import {mkConfig, download, generateCsv} from 'export-to-csv';
import {setExportTable} from '@common/experiments-compare/actions/compare-header.actions';
import {Table} from 'primeng/table';
import {ExperimentCompareSettings} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {GroupedList} from '@common/tasks/tasks.model';
import {sortMetricsList} from '@common/tasks/tasks.utils';

interface ValueMode {
  key: string;
  name: string;
}

interface ValueModes {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  min_values: ValueMode,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  max_values: ValueMode,
  values: ValueMode,
}

const VALUE_MODES: ValueModes = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  min_values: {
    key: 'min_value',
    name: 'Min Value'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  max_values: {
    key: 'max_value',
    name: 'Max Value'
  },
  values: {
    key: 'value',
    name: 'Last Value'
  },
};


interface tableRow {
  metricId: string;
  variantId: string;
  metric: string;
  variant: string;
  firstMetricRow: boolean;
  values: { [expId: string]: Task['last_metrics'] };
}

interface ExtTask extends Task {
  orgName?: string;
}

@Component({
  selector: 'sm-experiment-compare-metric-values',
  templateUrl: './experiment-compare-metric-values.component.html',
  styleUrls: ['./experiment-compare-metric-values.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareMetricValuesComponent implements OnInit, OnDestroy {
  protected readonly trackById = trackById;

  public experiments: Array<ExtTask> = [];
  public taskIds: string[];
  public valuesMode: ValueMode;
  private entityType: EntityTypeEnum;
  private comparedTasks$: Observable<Array<Task>>;
  public dataTable: tableRow[];
  public dataTableFiltered: tableRow[];
  public variantFilter = new FormControl('');
  public selectShowRowExtremes$: Observable<boolean>;
  public listSearchTerm: string;
  public metricVariantList: GroupedList;
  public filterOpen: boolean;
  public experimentsColor: { [name: string]: string };

  private subs = new Subscription();
  private selectExportTable$: Observable<boolean>;
  public showFilterTooltip = false;

  @ViewChildren(Table) public tableComp: QueryList<Table>;
  private scrollContainer: HTMLDivElement;
  public scrolled: boolean;
  public filterValue: string;
  public settings: ExperimentCompareSettings = {} as ExperimentCompareSettings;
  private initialSettings = {
    selectedMetricsScalar: []
  } as ExperimentCompareSettings
  private originalSettings: string[];
  private selectedMetrics$: Observable<ExperimentCompareSettings>;

  @HostListener('window:beforeunload', ['$event']) unloadHandler() {
    this.saveSettingsState();
  }

  constructor(
    private route: ActivatedRoute,
    public store: Store,
    private changeDetection: ChangeDetectorRef,
    private refresh: RefreshService,
    private colorHash: ColorHashService
  ) {
    this.comparedTasks$ = this.store.select(selectCompareMetricsValuesExperiments);
    this.selectShowRowExtremes$ = this.store.select(selectShowRowExtremes);
    this.selectExportTable$ = this.store.select(selectExportTable).pipe(filter(e => !!e));
    this.selectedMetrics$ = this.store.select(selectSelectedExperimentSettings).pipe(distinctUntilChanged(isEqual));
  }

  ngOnInit() {
    this.entityType = this.route.snapshot.parent.parent.data.entityType;
    this.subs.add(this.store.select(selectRouterConfig).pipe(
      map(params => params?.at(-1).replace('-', '_')),
      distinctUntilChanged()
    ).subscribe((valuesMode) => {
      this.valuesMode = VALUE_MODES[valuesMode] || VALUE_MODES['values'];
      this.changeDetection.detectChanges();
    }));

    this.subs.add(this.store.select(selectRouterParams).pipe(
      distinctUntilKeyChanged('ids'),
      map(params => params?.ids?.split(',')),
      tap(taskIds => this.taskIds = taskIds),
      filter(taskIds => !!taskIds && taskIds?.join(',') !== this.getExperimentIdsParams(this.experiments))
    )
      .subscribe((experimentIds: string[]) => {
        this.store.dispatch(setSelectedExperiments({selectedExperiments: this.taskIds}));
        this.store.dispatch(metricsValuesActions.getComparedExperimentsMetricsValues({
          taskIds: experimentIds,
          entity: this.entityType
        }));
      }));

    this.subs.add(this.comparedTasks$
      .pipe(
        filter(exp => !!exp),
        distinctUntilChanged(),
        tap(experiments => {
          const nameRepetitions = experiments.reduce((acc, exp) => {
            acc[exp.name] = (acc[exp.name] ?? 0) + 1;
            return acc;
          }, {});
          this.experiments = experiments.map(exp => nameRepetitions[exp.name] > 1 ? {...exp, orgName: exp.name, name: `${exp.name}.${exp.id.substring(0, 6)}`} : exp);
          this.experimentsColor = experiments.reduce((acc, exp) => {
            acc[exp.id] = rgbList2Hex(this.colorHash.initColor(`${exp.name}-${exp.id}`));
            return acc;
          }, {} as { [name: string]: string });
        })
      )
      .subscribe(experiments => {
        this.buildTableData(experiments);
        this.changeDetection.detectChanges();
        this.startTableScrollListener();
      }));

    this.subs.add(this.refresh.tick
      .pipe(filter(auto => auto !== null))
      .subscribe((autoRefresh) => this.store.dispatch(
        metricsValuesActions.getComparedExperimentsMetricsValues({taskIds: this.taskIds, entity: this.entityType, autoRefresh})
      )));

    this.selectedMetrics$.pipe(combineLatestWith(this.variantFilter.valueChanges.pipe(startWith('')))).subscribe(([, variantFilter]) => {
      this.filterValue = variantFilter;
      this.filter(this.filterValue);
    });

    this.subs.add(this.colorHash.getColorsObservable().pipe(
    ).subscribe(() => {
      this.experimentsColor = this.experiments?.reduce((acc, exp) => {
        acc[exp.id] = rgbList2Hex(this.colorHash.initColor(`${exp.orgName ?? exp.name}-${exp.id}`));
        return acc;
      }, {} as { [name: string]: string });
      this.changeDetection.detectChanges();
    }));

    this.subs.add(this.selectExportTable$.subscribe(() => {
      this.dataTableFiltered.length && this.exportToCSV();
      this.store.dispatch(setExportTable({export: false}));
    }));

    this.subs.add(this.selectedMetrics$.pipe(take(1)).subscribe(settings => {
      const selectedScalars = settings?.selectedMetricsScalar;
      this.originalSettings = selectedScalars;
      this.settings = settings ? {...this.initialSettings, selectedMetricsScalar: selectedScalars} : {...this.initialSettings} as ExperimentCompareSettings;
    }));
  }

  private startTableScrollListener() {
    this.scrollContainer = this.tableComp?.first?.el.nativeElement.getElementsByClassName('p-scroller')[0] ?? this.tableComp?.first?.el.nativeElement.getElementsByClassName('p-datatable-wrapper')[0] as HTMLDivElement;
    if (this.scrollContainer) {
      fromEvent(this.scrollContainer, 'scroll').pipe(throttleTime(150, undefined, {leading: true, trailing: true})).subscribe((e: Event) => {
        this.scrolled = (e.target as HTMLDivElement).scrollLeft > 10;
        this.changeDetection.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    this.saveSettingsState();
    this.store.dispatch(metricsValuesActions.resetState());
    this.subs.unsubscribe();
  }

  buildTableData(experiments: Task[]) {
    if (experiments?.length > 0) {
      const lastMetrics = experiments.map(exp => exp.last_metrics);
      let allMetricsVariants: Task['last_metrics'] = {};
      allMetricsVariants = mergeWith(allMetricsVariants, ...lastMetrics);

      this.metricVariantList = {};
      this.dataTable = sortMetricsList(Object.keys(allMetricsVariants)).map((metricId) => Object.keys(allMetricsVariants[metricId]).map(variantId => {
        let metric, variant;
        return {
          metricId,
          variantId,
          ...experiments.reduce((acc, exp) => {
            acc.values[exp.id] = exp.last_metrics[metricId]?.[variantId] as Task['last_metrics'];
            if (!metric && !variant && exp.last_metrics[metricId]?.[variantId]) {
              metric = (metric ?? exp.last_metrics[metricId][variantId].metric).replace('Summary', ' Summary');
              variant = variant ?? exp.last_metrics[metricId][variantId].variant;
            }
            if (metric) {
              if (this.metricVariantList[metric]) {
                this.metricVariantList[metric][variant] = {};
              } else {
                this.metricVariantList[metric] = {[variant]: {}};
              }
            }
            return {
              metric,
              variant,
              values: acc.values,
              firstMetricRow: false,
              min: acc.min ? Math.min(acc.min, exp.last_metrics[metricId]?.[variantId]?.[this.valuesMode.key] ?? acc.min) : exp.last_metrics[metricId]?.[variantId]?.[this.valuesMode.key],
              max: acc.max ? Math.max(acc.max, exp.last_metrics[metricId]?.[variantId]?.[this.valuesMode.key] ?? acc.max) : exp.last_metrics[metricId]?.[variantId]?.[this.valuesMode.key]
            };
          }, {values: {}} as { metric, variant, firstMetricRow: boolean, min:  number, max: number, values: { [expId: string]: Task['last_metrics'] } })
        };
      })).flat(1);
      if (!this.settings.selectedMetricsScalar || this.settings.selectedMetricsScalar?.length === 0) {
        this.settings.selectedMetricsScalar = this.getFirstMetrics(10);
      }
      this.filter(this.filterValue);
    }
  }

  filter = (value: string) => {
    if (!this.dataTable) {
      return;
    }
    this.dataTableFiltered = this.dataTable.filter(row => this.settings.selectedMetricsScalar?.includes(`${row.metric}${row.variant}`)).filter(row => row.metric.includes(value) || row.variant.includes(value));
    this.showFilterTooltip = true;
    let previousMetric: string;
    this.dataTableFiltered.forEach(row => {
      row.firstMetricRow = row.metric !== previousMetric;
      previousMetric = row.metric;
    });
  };

  private getExperimentIdsParams(experiments: Array<{ id?: string }>): string {
    return experiments ? experiments.map(e => e.id).toString() : '';
  }

  clear() {
    this.variantFilter.reset('');
  }

  searchTermChanged(searchTerm: string) {
    this.listSearchTerm = searchTerm;
  }

  selectedMetricsChanged(selectedMetrics: string[]) {
    this.settings = {...this.settings, selectedMetricsScalar: selectedMetrics};
    this.filter(this.filterValue);
  }

  exportToCSV() {
    const options = mkConfig({
      filename: `Scalars compare table`,
      showColumnHeaders: true,
      columnHeaders: ['Metric', 'Variant'].concat(this.experiments.map(ex => ex.name))
    });
    const csv = generateCsv(options)(this.dataTableFiltered.map(row => ({
      Metric: row.metric,
      Variant: row.variant,
      ...Object.values(row.values).map(value => value?.[this.valuesMode.key] ?? '')
    })));
    download(options)(csv);
  }

  trackByFunction(index: number, item) {
    return item?.id || item?.name || index;
  }

  showAll() {
    const firstSelectedMetrics = this.getFirstMetrics(10);
    this.settings = {...this.settings, selectedMetricsScalar: this.originalSettings.length > 0 ? this.originalSettings : firstSelectedMetrics};
    this.filter(this.filterValue);
  }

  private getFirstMetrics(number: number) {
    const sortedMetrics = Object.entries(this.metricVariantList).sort((a, b) => a[0] > b[0]? -1 : 1);
    return sortedMetrics.map(([metric, variants]) => {
      const sortedVariants = Object.keys(variants).sort();
      return sortedVariants.map(variant => metric + variant)
    }).flat().slice(0, number);
  }

  private saveSettingsState() {
    if (!isEqual(this.settings.selectedMetricsScalar, this.originalSettings)) {
      this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {selectedMetricsScalar: this.settings.selectedMetricsScalar}}));
    }
  }
}
