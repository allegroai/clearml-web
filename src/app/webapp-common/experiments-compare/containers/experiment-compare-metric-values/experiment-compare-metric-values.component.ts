import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {combineLatestWith, distinctUntilChanged, distinctUntilKeyChanged, filter, map, take, tap, throttleTime} from 'rxjs/operators';
import {isEqual, mergeWith} from 'lodash-es';
import {fromEvent, Observable, startWith, Subscription} from 'rxjs';
import * as metricsValuesActions from '../../actions/experiments-compare-metrics-values.actions';
import {selectCompareMetricsValuesExperiments, selectExportTable, selectSelectedSettingsHiddenScalar, selectShowRowExtremes} from '../../reducers';
import {ActivatedRoute, Router} from '@angular/router';
import {RefreshService} from '@common/core/services/refresh.service';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {Task} from '~/business-logic/model/tasks/task';
import {FormControl} from '@angular/forms';
import {setExperimentSettings, setSelectedExperiments} from '@common/experiments-compare/actions/experiments-compare-charts.actions';
import {GroupedList} from '@common/tasks/tasks.utils';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {rgbList2Hex} from '@common/shared/services/color-hash/color-hash.utils';
import {trackById} from '@common/shared/utils/forms-track-by';
import {ExportToCsv, Options} from 'export-to-csv';
import {setExportTable} from '@common/experiments-compare/actions/compare-header.actions';
import {Table} from 'primeng/table';
import {ExperimentCompareSettings} from "@common/experiments-compare/reducers/experiments-compare-charts.reducer";

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
  public listOfHidden$: Observable<string[]>;
  public filterOpen: boolean;
  public experimentsColor: { [name: string]: string };

  private subs = new Subscription();
  private selectExportTable$: Observable<boolean>;

  @ViewChildren(Table) public tableComp: QueryList<Table>;
  private scrollContainer: HTMLDivElement;
  public scrolled: boolean;
  private filterValue: string;
  public settings: ExperimentCompareSettings = {} as ExperimentCompareSettings;
  private initialSettings = {
    hiddenMetricsScalar: []
  } as ExperimentCompareSettings
  private originalSettings: string[];

  @HostListener("window:beforeunload", ["$event"]) unloadHandler() {
    this.saveSettingsState();
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public store: Store,
    private changeDetection: ChangeDetectorRef,
    private refresh: RefreshService,
    private colorHash: ColorHashService
  ) {
    this.comparedTasks$ = this.store.select(selectCompareMetricsValuesExperiments);
    this.selectShowRowExtremes$ = this.store.select(selectShowRowExtremes);
    this.selectExportTable$ = this.store.select(selectExportTable).pipe(filter(e => !!e));
    this.listOfHidden$ = this.store.select(selectSelectedSettingsHiddenScalar).pipe(distinctUntilChanged(isEqual));
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

    this.listOfHidden$.pipe(combineLatestWith(this.variantFilter.valueChanges.pipe(startWith('')))).subscribe(([, variantFilter]) => {
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

    this.subs.add(this.listOfHidden$.pipe(take(1)).subscribe(hiddenScalars => {
      this.originalSettings = hiddenScalars;
      this.settings = hiddenScalars ? {...this.initialSettings, hiddenMetricsScalar: hiddenScalars} : {...this.initialSettings} as ExperimentCompareSettings;
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
      const dataTable = Object.entries(allMetricsVariants).map(([metricId, metricsVar]) => Object.keys(metricsVar).map(variantId => {
        let metric, variant;
        return {
          metricId,
          variantId,
          ...experiments.reduce((acc, exp) => {
            acc.values[exp.id] = exp.last_metrics[metricId]?.[variantId] as Task['last_metrics'];
            if (!metric && !variant && exp.last_metrics[metricId]?.[variantId]) {
              metric = metric ?? exp.last_metrics[metricId][variantId].metric;
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
      this.dataTable = dataTable.sort((a) => a.metric.startsWith(':') ? 1 : -1);
      this.filter(this.filterValue);
    }
  }

  filter = (value: string) => {
    if (!this.dataTable) {
      return;
    }
    this.dataTableFiltered = this.dataTable.filter(row => !this.settings.hiddenMetricsScalar?.includes(`${row.metric}${row.variant}`)).filter(row => row.metric.includes(value) || row.variant.includes(value));
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

  hiddenListChanged(hiddenList: string[]) {
    this.settings = {...this.settings, hiddenMetricsScalar: hiddenList};
    this.filter(this.filterValue);
  }

  exportToCSV() {
    const options: Options = {
      filename: `Scalars compare table`,
      showLabels: true,
      headers: ['Metric', 'Variant'].concat(this.experiments.map(ex => ex.name))
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.dataTableFiltered.map(row => {
      return [row.metric, row.variant, ...Object.values(row.values).map(value => value?.[this.valuesMode.key] ?? '')];
    }));
  }

  trackByFunction(index: number, item) {
    return item?.id || item?.name || index;
  }

  showAll() {
    this.settings = {...this.settings, hiddenMetricsScalar: []};
    this.filter(this.filterValue);
  }

  private saveSettingsState() {
    if (!isEqual(this.settings.hiddenMetricsScalar, this.originalSettings)) {
      this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {hiddenMetricsScalar: this.settings.hiddenMetricsScalar}}));
    }
  }
}
