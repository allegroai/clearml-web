import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {selectMetricVariants} from '~/features/experiments/reducers';
import {Store} from '@ngrx/store';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {getCustomMetrics} from '@common/experiments/actions/common-experiments-view.actions';
import {fetchGraphData, setMetricVariant} from '@common/core/actions/projects.actions';
import {ProjectStatsGraphData, selectGraphData, selectSelectedMetricVariantForCurrProject} from '@common/core/reducers/projects.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {filter, skip, take, tap} from 'rxjs/operators';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {Subscription} from 'rxjs';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {createMetricColumn, MetricColumn} from '@common/shared/utils/tableParamEncode';
import {Router} from '@angular/router';
import {MetricValueType} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {MatDialog} from '@angular/material/dialog';
import {
  MetricForStatsDialogComponent
} from '@common/project-info/conteiners/metric-for-stats-dialog/metric-for-stats-dialog.component';

@Component({
  selector: 'sm-project-stats',
  templateUrl: './project-stats.component.html',
  styleUrls: ['./project-stats.component.scss']
})
export class ProjectStatsComponent implements OnInit, OnDestroy {
  private _project: Project;

  public metricVariants$: Observable<MetricVariantResult[]>;
  public selectedVariant: MetricColumn;
  public colors: string[];
  public metricVariantSelection = [];
  public graphData: ProjectStatsGraphData[];
  public loading = false;
  public gotOptions;
  public variantDisplay: string = 'Select Metric & Variant';
  private sub = new Subscription();
  states = [
    {label: 'Completed or Stopped', type: TaskStatusEnum.Completed},
    {label: 'Published', type: TaskStatusEnum.Published},
    {label: 'Failed', type: TaskStatusEnum.Failed}
  ];

  @Input() set project(proj: Project) {
    if (proj) {
      this._project = proj;
      this.gotOptions = undefined;
    }
  }
  get project() {
    return this._project;
  }

  constructor(private store: Store, private router: Router, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.sub.add(this.store.select(selectSelectedMetricVariantForCurrProject)
      .subscribe(data => {
        this.selectedVariant = data;
        this.variantDisplay = data && (data?.metric + ' \u203A ' +
          data.variant + ' \u203A ' + this.getValueName(this.selectedVariant.valueType));
        this.loading = true;
        this.store.dispatch(fetchGraphData());
        this.metricVariantSelection = data ? [createMetricColumn(data, this.project.id)] : [];
      })
    );

    this.sub.add(this.store.select(selectGraphData)
      .pipe(filter(values => !!values))
      .subscribe(values => {
        this.colors = values.map(val => this.statusToColor(val.status));
        this.loading = false;
        this.graphData = values.map(val => ({
          ...val,
          title: val.name,
          nameExt: `Created By ${val.user}, Finished ${new Date(val.x).toLocaleString()}`,
          name: val.id
        }));
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
      .subscribe(variants => this.dialog.open(MetricForStatsDialogComponent,
        {data: {variants, metricVariantSelection: this.metricVariantSelection}})
        .afterClosed().subscribe(selection => this.selectedMetricToShow(selection))
      );
  }

  public statusToColor(status: string) {
    switch (status) {
      case TaskStatusEnum.Completed:
      case TaskStatusEnum.Stopped:
        return '#009aff';
      case TaskStatusEnum.Failed:
        return '#ff001f';
      case TaskStatusEnum.Published:
        return '#d3ff00';
      default:
        return '#50e3c2';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private typeToIcon(type: string) {
   switch (type) {
     case TaskTypeEnum.Training:
       return '\uea33';
     case TaskTypeEnum.Testing:
       return '\ueA32';
     case TaskTypeEnum.DataProcessing:
       return '\ueA2c';
     case TaskTypeEnum.Qc:
       return '\ueA30';
     case TaskTypeEnum.Service:
       return '\ueA31';
     case TaskTypeEnum.Optimizer:
       return '\ueA2F';
     case TaskTypeEnum.Monitor:
       return '\ueA2E';
     case TaskTypeEnum.Inference:
       return '\ueA2D';
     case TaskTypeEnum.Application:
       return '\ueA29';
     case TaskTypeEnum.Controller:
       return '\ueA2A';
     default:
       return '\ueA2B';
   }
  }

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
}
