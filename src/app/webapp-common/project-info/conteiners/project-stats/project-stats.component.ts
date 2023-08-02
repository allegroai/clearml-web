import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {selectMetricVariants} from '~/features/experiments/reducers';
import {Store} from '@ngrx/store';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {getCustomMetrics} from '@common/experiments/actions/common-experiments-view.actions';
import {fetchGraphData, setMetricVariant, toggleState} from '@common/core/actions/projects.actions';
import {
  ProjectStatsGraphData,
  selectGraphData, selectGraphHiddenStates,
  selectSelectedMetricVariantForCurrProject
} from '@common/core/reducers/projects.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {debounceTime, filter, skip, take, tap} from 'rxjs/operators';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {combineLatest, Subscription} from 'rxjs';
import {createMetricColumn, MetricColumn} from '@common/shared/utils/tableParamEncode';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {
  MetricForStatsDialogComponent
} from '@common/project-info/conteiners/metric-for-stats-dialog/metric-for-stats-dialog.component';
import {MetricValueType} from '@common/experiments-compare/experiments-compare.constants';
import {ScatterPlotComponent} from '@common/shared/components/charts/scatter-plot/scatter-plot.component';
import tinycolor from 'tinycolor2';

@Component({
  selector: 'sm-project-stats',
  templateUrl: './project-stats.component.html',
  styleUrls: ['./project-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectStatsComponent implements OnInit, OnDestroy {
  private _project: Project;

  public metricVariants$: Observable<MetricVariantResult[]>;
  public selectedVariant: MetricColumn;
  public colors: string[];
  public metricVariantSelection = [];
  public graphData = null as ProjectStatsGraphData[];
  public loading = true;
  public gotOptions;
  public variantDisplay: string = 'Select Metric & Variant';
  private sub = new Subscription();
  states = [
    {label: 'Completed or Stopped', type: TaskStatusEnum.Completed},
    {label: 'Published', type: TaskStatusEnum.Published},
    {label: 'Failed', type: TaskStatusEnum.Failed},
    {label: 'Running', type: TaskStatusEnum.InProgress}
  ] as {label: string; type: TaskStatusEnum; color?: string}[];

  @Input() set project(proj: Project) {
    if (proj) {
      this._project = proj;
      this.gotOptions = undefined;
    }
  }
  get project() {
    return this._project;
  }

  constructor(private store: Store, private router: Router, private dialog: MatDialog, private cdr: ChangeDetectorRef) {
  }

  @ViewChild(ScatterPlotComponent) plot: ScatterPlotComponent;

  ngOnInit(): void {
    this.sub.add(this.store.select(selectSelectedMetricVariantForCurrProject)
      .subscribe(data => {
        this.selectedVariant = data;
        this.variantDisplay = data && (data?.metric + ' \u203A ' +
          data.variant + ' \u203A ' + this.getValueName(this.selectedVariant.valueType));
        this.loading = true;
        this.store.dispatch(fetchGraphData());
        this.metricVariantSelection = data ? [createMetricColumn(data, this.project.id)] : [];
        this.cdr.detectChanges();
      })
    );

    this.sub.add(combineLatest([
      this.store.select(selectGraphData),
      this.store.select(selectGraphHiddenStates)
      ])
        .pipe(
          debounceTime(0),
          filter(([values]) => !!values)
        )
        .subscribe(([values, hidden]) => {
          const filteredValues = values.filter(val => !hidden?.[val.status]);
          this.colors = filteredValues.map(val => this.statusToColor(val.status, hidden?.[val.status]));
          this.states = this.states.map(state => ({...state, color: this.statusToColor(state.type, hidden?.[state.type])}));
          this.loading = false;
          this.graphData = filteredValues
            .map(val => ({
            ...val,
            title: val.name,
            name: `Created By ${val.user}, Finished ${new Date(val.x).toLocaleString()}`,
            value: val.y
          }));
          this.cdr.detectChanges();
          this.plot?.onResize();
        })
    );
  }

  selectedMetricToShow(
    event: { variant: MetricVariantResult; addCol: boolean; valueType: MetricValueType },
  ) {
    if (event === null) {
      this.store.dispatch(setMetricVariant({projectId: this.project.id, col:null}));
      return;
    }
    if (!event?.valueType) {
      return;
    }

    const col = {
      metricHash: event.variant.metric_hash,
      variantHash: event.variant.variant_hash,
      valueType: event.valueType,
      metric: event.variant.metric,
      variant: event.variant.variant
    };
    this.store.dispatch(setMetricVariant({projectId: this.project.id, col}));
  }

  selectVariant() {
    if(!this.gotOptions) {
      this.gotOptions = false;
      this.store.dispatch(getCustomMetrics());
    }
    this.store.select(selectMetricVariants)
      .pipe(
        skip(this.gotOptions ? 0 : 1),
        tap(() => this.gotOptions !== undefined && (this.gotOptions = true)),
        take(1)
      )
      .subscribe(variants => this.dialog.open(
          MetricForStatsDialogComponent,
          {data: {variants, metricVariantSelection: this.metricVariantSelection}}
        ).afterClosed().subscribe(selection => this.selectedMetricToShow(selection))
      );
  }

  public statusToColor(status: string, hidden: boolean) {
    let color: string;
    switch (status) {
      case TaskStatusEnum.Completed:
      case TaskStatusEnum.Stopped:
        color = '#009aff';
        break;
      case TaskStatusEnum.Failed:
        color = '#ff001f';
        break;
      case TaskStatusEnum.Published:
        color = '#d3ff00';
        break;
      case TaskStatusEnum.InProgress:
        color = '#14aa8c';
        break;
      default:
        color = '#50e3c2';
        break;
    }
    if (hidden) {
      return tinycolor(color).darken(30).toHexString();
    }
    return color;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // private typeToIcon(type: string) {
  //  switch (type) {
  //    case TaskTypeEnum.Training:
  //      return '\uea33';
  //    case TaskTypeEnum.Testing:
  //      return '\ueA32';
  //    case TaskTypeEnum.DataProcessing:
  //      return '\ueA2c';
  //    case TaskTypeEnum.Qc:
  //      return '\ueA30';
  //    case TaskTypeEnum.Service:
  //      return '\ueA31';
  //    case TaskTypeEnum.Optimizer:
  //      return '\ueA2F';
  //    case TaskTypeEnum.Monitor:
  //      return '\ueA2E';
  //    case TaskTypeEnum.Inference:
  //      return '\ueA2D';
  //    case TaskTypeEnum.Application:
  //      return '\ueA29';
  //    case TaskTypeEnum.Controller:
  //      return '\ueA2A';
  //    default:
  //      return '\ueA2B';
  //  }
  // }
  trackByType = (index: number, state) => state.type;

  experimentClicked(event: ProjectStatsGraphData) {
    this.router.navigateByUrl(`/projects/${this.project.id}/experiments/${event.id}`);
  }

  getValueName(valueType: MetricValueType) {
    switch (valueType) {
      case 'max_value':
        return 'Max';
      case 'min_value':
        return 'Min';
      default:
        return 'Last';
    }
  }

  toggleState(state: TaskStatusEnum) {
    this.loading = true;
    this.graphData = null;
    this.cdr.detectChanges();
    this.store.dispatch(toggleState({state}));
    if(state === TaskStatusEnum.Completed) {
      this.store.dispatch(toggleState({state: TaskStatusEnum.Stopped}));
    }
  }
}
