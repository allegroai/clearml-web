import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2, inject, viewChild, viewChildren, input, output, signal, effect, computed, untracked
} from '@angular/core';
import {allowedMergedTypes, sortMetricsList} from '../../tasks/tasks.utils';
import {SingleGraphComponent} from '../single-graph/single-graph.component';
import {
  ChartHoverModeEnum,
  EXPERIMENT_GRAPH_ID_PREFIX,
  SINGLE_GRAPH_ID_PREFIX, singleValueChartTitle
} from '../../experiments/shared/common-experiments.const';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {GroupByCharts, groupByCharts} from '../../experiments/actions/common-experiment-output.actions';
import {Store} from '@ngrx/store';
import {ResizeEvent} from 'angular-resizable-element';
import {distinctUntilChanged, filter, map, skip, take} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ExtFrame, ExtLegend, VisibleExtFrame} from '../single-graph/plotly-graph-base';
import {getSignedUrl} from '../../core/actions/common-auth.actions';
import {selectSignedUrl} from '../../core/reducers/common-auth-reducer';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {
  EventsGetTaskSingleValueMetricsResponseValues
} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {v4} from 'uuid';
import {selectGraphsPerRow} from '@common/experiments/reducers';
import {setGraphsPerRow} from '@common/experiments/actions/common-experiment-output.actions';
import {SmoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';
import {maxInArray} from '@common/shared/utils/helpers.util';
import {explicitEffect} from 'ngxtension/explicit-effect';

@Component({
  selector: 'sm-experiment-graphs',
  templateUrl: './experiment-graphs.component.html',
  styleUrls: ['./experiment-graphs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExperimentGraphsComponent implements OnDestroy {
  private el = inject(ElementRef);
  private changeDetection = inject(ChangeDetectorRef);
  private store = inject(Store);
  private renderer = inject(Renderer2);
  readonly experimentGraphidPrefix = EXPERIMENT_GRAPH_ID_PREFIX;
  readonly singleGraphidPrefix = SINGLE_GRAPH_ID_PREFIX;
  allMetrics = viewChild<ElementRef>('allMetrics');
  private timer: number;
  private subs = new Subscription();
  public height = 450;
  public width: number;
  private minWidth = 350;
  private resizeTextElement: HTMLDivElement;
  private graphsNumberLimit: number;
  public activeResizeElement: HTMLDivElement;
  protected readonly singleValueChartTitle = singleValueChartTitle;
  protected graphsData = signal<Record<string, VisibleExtFrame[]>>({});
  private previousWindowWidth: number;

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.timer);
    if (window.innerWidth !== this.previousWindowWidth) {
      this.graphsState().graphsPerRow.set(this.allGroupsSingleGraphs() ? 1 : this.graphsState().graphsPerRow());
    }
    this.calculateGraphsLayout();
    this.previousWindowWidth = window.innerWidth;
  }

  hiddenList = input<string[]>([]);
  isGroupGraphs = input<boolean>();
  legendStringLength = input(19);
  minimized = input<boolean>();
  isDarkTheme = input<boolean>();
  showLoaderOnDraw = input(true);
  legendConfiguration = input<Partial<ExtLegend>>({});
  breakPoint = input(700);
  isCompare = input(false);
  hoverMode = input<ChartHoverModeEnum>();
  disableResize = input(false);
  singleValueData = input<EventsGetTaskSingleValueMetricsResponseValues[]>();
  multipleSingleValueData = input<ExtFrame>();
  experimentName = input<string>();
  splitSize = input<number>();

  smoothWeight = input<number>();
  smoothType = input<SmoothTypeEnum>();
  groupBy = input<GroupByCharts>();
  xAxisType = input<ScalarKeyEnum>();
  exportForReport = input(true);

  resetGraphs = output();
  hoverModeChanged = output<ChartHoverModeEnum>();
  createEmbedCode = output<{
    metrics?: string[];
    variants?: string[];
    originalObject?: string[];
    xaxis?: ScalarKeyEnum;
    group?: boolean;
    seriesName?: string[];
    domRect: DOMRect;
  }>();

  allMetricGroups = viewChildren<ElementRef>('metricGroup');
  singleGraphs = viewChildren<ElementRef>('singleGraphContainer');
  singleValueGraph = viewChildren<SingleGraphComponent>('singleValueGraph');
  allGraphs = viewChildren(SingleGraphComponent);

  graphsPerRow = this.store.selectSignal(selectGraphsPerRow);


  constructor() {

    effect(() => {
      if (this.hiddenList() && this.splitSize()) {
        untracked(() => this.calculateGraphsLayout());
      }
    });

    effect(() => {
      if (this.graphsState().maxUserHeight()) {
        this.height = this.graphsState().maxUserHeight();
      }
    });

    explicitEffect(
      [this.metrics],
      ([metrics]) => {
        if (metrics) {
          this.calculateGraphsLayout(0, (this.disableResize() || this.allGroupsSingleGraphs()) ? 1 : this.graphsState().graphsPerRow());
        }
      })

    effect(() => {
      const graphsData = this.addId(this.sortGraphsData(this.metrics() || {}));
      Object.values(graphsData).forEach((graphs: ExtFrame[]) => {
        graphs.forEach((graph: ExtFrame) => {
          if ((graph?.layout?.images?.length ?? 0) > 0) {
            graph.layout.images.forEach((image: Plotly.Image) => {
                this.store.dispatch(getSignedUrl({
                  url: image.source,
                  config: {skipFileServer: false, skipLocalFile: false, disableCache: graph.timestamp}
                }));
                this.subs.add(this.store.select(selectSignedUrl(image.source))
                  .pipe(
                    filter(signed => !!signed?.signed),
                    map(({signed: signedUrl}) => signedUrl),
                    take(1)
                  ).subscribe(url => image.source = url)
                );
              }
            );
          }
        });
      });
      this.graphsData.set(graphsData);
    }, {allowSignalWrites: true})


    this.subs.add(this.store.select(selectRouterParams).pipe(
      map(params => params?.experimentId ?? params?.modelId),
      distinctUntilChanged(),
      skip(1) // don't need first null->expId
    ).subscribe(() => {
      this.store.dispatch(setGraphsPerRow({graphsPerRow: 2}));
      // this.graphsData = null;
     this.graphsState().numIterations.set(0);
     this.graphsState().graphList.set([]);
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  metrics = input<Record<string, ExtFrame[]>>();

  graphsState = computed(() => ({
    graphsPerRow: signal(this.graphsPerRow() ?? 2),
    graphList: signal(this.metrics() ? sortMetricsList(Object.keys(this.metrics())) : []),
    noGraphs: signal((this.metrics() !== undefined) && (this.metrics() !== null) && Object.keys(this.metrics()).length === 0),
    numIterations: signal(Array.from(new Set(Object.values(this.graphsData()).reduce((acc, frames) =>
      [...acc, ...frames.map(frame => frame.iter)], []).flat())).filter(a => Number.isInteger(a)).length),
    maxUserWidth: signal(maxInArray(Object.values(this.graphsData()).flat().map((chart: ExtFrame) => chart.layout?.width || 0))),
    maxUserHeight: signal(maxInArray(Object.values(this.graphsData()).flat().map((chart: ExtFrame) => chart.layout?.height || 0)))
  }));




  sortGraphsData = (data: Record<string, ExtFrame[]>) =>
    Object.entries(data).reduce((acc, [label, graphs]) =>
      ({
        ...acc,
        [label]: graphs.sort((a, b) => {
          a.layout.title = a.layout.title || '';
          b.layout.title = b.layout.title || '';
          return a.layout.title === b.layout.title ?
            b.iter - a.iter :
            (a.layout.title as string).localeCompare((b.layout.title as string), undefined, {
              numeric: true,
              sensitivity: 'base'
            });
        })
      }), {} as Record<string, ExtFrame[]>);


  trackByIdFn = (item: ExtFrame) =>
    `${item.layout.title} ${item.data?.length} ${(this.isDarkTheme() ? '' : item.iter ?? '')}`;

  isWidthBigEnough() {
    return this.el.nativeElement.clientWidth > this.breakPoint();
  }

  private allGroupsSingleGraphs() {
    const groups = Object.values(this.graphsData() || {});
    return (this.isGroupGraphs() || this.disableResize() || groups.length === 1) && groups.every(group => group.length === 1);
  }

  public calculateGraphsLayout(delay = 200, graphsPerRow?: number) {
    if (this.graphsState().noGraphs()) {
      return;
    }
    this.timer = window.setTimeout(() => {
      const containerWidth = this.el.nativeElement.clientWidth;
      graphsPerRow = graphsPerRow ?? this.graphsState().graphsPerRow();
      if (this.allGraphs() && containerWidth) {
        while (containerWidth / graphsPerRow < this.minWidth && graphsPerRow > 1 || containerWidth / graphsPerRow < this.graphsState().maxUserWidth()) {
          graphsPerRow -= 1;
        }
        const width = Math.floor(containerWidth / graphsPerRow);
        this.width = width - 16 / graphsPerRow;
        this.height = this.graphsState().maxUserHeight() || this.height;
        if (!this.isGroupGraphs()) {
          this.allMetricGroups()?.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`));
          this.allMetricGroups()?.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'height', `${this.height}px`));
        } else {
          this.allMetricGroups()?.forEach(metricGroup => this.renderer.removeStyle(metricGroup.nativeElement, 'width'));
          this.allMetricGroups()?.forEach(metricGroup => this.renderer.removeStyle(metricGroup.nativeElement, 'height'));
          this.singleGraphs()?.forEach(singleGraph => this.renderer.setStyle(singleGraph.nativeElement, 'width', `${this.width}px`));
          this.singleGraphs()?.forEach(singleGraph => this.renderer.setStyle(singleGraph.nativeElement, 'height', `${this.height}px`));
        }
      }
      this.graphsState().graphsPerRow.set(graphsPerRow);
      this.changeDetection.markForCheck();
    }, delay);
  }

  sizeChanged($event: ResizeEvent) {
    this.activeResizeElement = null;
    if ($event.edges.right) {
      const containerWidth = this.el.nativeElement.clientWidth;
      const userWidth = $event.rectangle.width;
      const graphsPerRow = this.calcGraphPerRow(userWidth, containerWidth);
      this.store.dispatch(setGraphsPerRow({graphsPerRow: graphsPerRow}));

      if (!this.isGroupGraphs()) {
        this.allMetricGroups().forEach(metricGroup => {
          this.width = containerWidth / graphsPerRow - 16 / graphsPerRow - 2;
          this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`);
        });
      } else {
        this.allMetricGroups()?.forEach(metricGroup => this.renderer.removeStyle(metricGroup.nativeElement, 'width'));
        this.allMetricGroups()?.forEach(metricGroup => this.renderer.removeStyle(metricGroup.nativeElement, 'height'));
        this.singleGraphs().forEach(singleGraph => {
          this.width = containerWidth / graphsPerRow - 16 / graphsPerRow - 2;
          this.renderer.setStyle(singleGraph.nativeElement, 'width', `${this.width}px`);
        });
      }
    }
    if ($event.edges.bottom) {
      this.height = $event.rectangle.height;
      if (!this.isGroupGraphs()) {
        this.allMetricGroups()?.forEach(metricGroup =>
          this.renderer.setStyle(metricGroup.nativeElement, 'height', `${this.height}px`));
      } else {
        this.singleGraphs()?.forEach(singleGraph =>
          this.renderer.setStyle(singleGraph.nativeElement, 'height', `${this.height}px`));
      }
      this.changeDetection.detectChanges();
    }
  }

  private calcGraphPerRow(userWidth: number, containerWidth: number) {
    let graphsPerRow: number;
    if (userWidth > 0.75 * containerWidth) {
      graphsPerRow = 1;
    } else if (userWidth > 0.33 * containerWidth) {
      graphsPerRow = 2;
    } else {
      graphsPerRow = Math.floor(containerWidth / userWidth);
    }
    return Math.min(graphsPerRow, this.graphsNumberLimit);
  }

  resizeStarted(metricGroup: HTMLDivElement, singleGraph?: HTMLDivElement) {
    this.activeResizeElement = singleGraph;
    this.changeDetection.detectChanges();
    this.graphsNumberLimit = this.isGroupGraphs() ? metricGroup.querySelectorAll(':not(.resize-ghost-element) > sm-single-graph').length : this.graphsState().graphList().length;
    this.resizeTextElement = singleGraph?.parentElement.querySelectorAll<HTMLDivElement>('.resize-ghost-element .resize-overlay-text')[0];
  }

  onResizing($event: ResizeEvent) {
    if ($event.edges.right && this.resizeTextElement) {
      const graphsPerRow = this.calcGraphPerRow($event.rectangle.width, this.el.nativeElement.clientWidth);
      this.store.dispatch(setGraphsPerRow({graphsPerRow: graphsPerRow}));
      const text = `${graphsPerRow > 1 ? graphsPerRow + ' graphs' : '1 graph'} per row`;
      this.renderer.setProperty(this.resizeTextElement, 'textContent', text);
    }
  }

  validateResize($event: ResizeEvent): boolean {
    return $event.rectangle.width > 350 && $event.rectangle.height > 250;
  }

  scrollToGraph(id: string) {
    const element = this.allMetrics().nativeElement.getElementsByClassName('graph-id')[EXPERIMENT_GRAPH_ID_PREFIX + id] as HTMLDivElement;
    if (element) {
      this.allMetrics().nativeElement.scrollTo({top: element.offsetTop, behavior: 'smooth'});
    } else if (this.allMetrics().nativeElement.getElementsByClassName('single-value-summary-section')[0]) {
      this.allMetrics().nativeElement.scrollTo({top: 0, behavior: 'smooth'});
    }
  }


  private addId(sortGraphsData1: Record<string, ExtFrame[]>): Record<string, VisibleExtFrame[]> {
    return Object.entries(sortGraphsData1).reduce((acc, [label, graphs]) =>
      ({
        ...acc,
        [label]: graphs.map((graph) => ({
          ...graph,
          id: v4(),
        }))
      }), {} as Record<string, VisibleExtFrame[]>);
  }

  public generateIdentifier = (chartItem: ExtFrame) => `${this.singleGraphidPrefix} ${this.experimentGraphidPrefix} ${chartItem.metric} ${chartItem.layout.title} ${chartItem.iter} ${chartItem.variant} ${(chartItem.layout.images && chartItem.layout.images[0]?.source)}`;


  creatingEmbedCodeGroup(metric: VisibleExtFrame[], domRect) {
    const objects = metric.map(m => m.data.filter(p => !p.fakePlot).map(p => p.task)).flat().filter(obj => obj);
    this.createEmbedCode.emit({
      xaxis: this.xAxisType(),
      originalObject: objects.length > 0 ? objects: Array.from(new Set(metric.map(m => m.task))),
      metrics: [metric[0]?.metric],
      variants: metric.map(m => m.variant),
      seriesName: metric.map(m => m.data[0]?.seriesName),
      ...(this.xAxisType() && {xaxis: this.xAxisType()}),
      group: true,
      domRect: domRect.getBoundingClientRect()
    });
  }

  creatingEmbedCode(chartItem: ExtFrame, {domRect, xaxis}: { xaxis: ScalarKeyEnum; domRect: DOMRect }) {
    if (!chartItem) {
      this.createEmbedCode.emit({xaxis, domRect});
      return;
    }

    if (!this.isCompare() && this.groupBy() === groupByCharts.none) {
      // split scalars by variants
      this.createEmbedCode.emit({
        metrics: [chartItem.data[0].originalMetric ?? chartItem.metric?.trim()],
        variants: [chartItem.data[0].name],
        ...((xaxis || this.xAxisType()) && {xaxis: xaxis ?? this.xAxisType()}),
        domRect
      });
    } else {
      this.createEmbedCode.emit({
        originalObject: chartItem.data.filter(p => !p.fakePlot).map(p => p.task).flat(),
        metrics: [chartItem.metric],
        variants: chartItem.variants ?? [chartItem.variant],
        ...((xaxis || this.xAxisType()) && {xaxis: xaxis ?? this.xAxisType()}),
        ...(chartItem.data.length < 2 && {originalObject: [chartItem.task]}),
        ...(chartItem.data[0]?.seriesName && {seriesName: [chartItem.data[0]?.seriesName]}),
        domRect
      });
    }
  }

  checkIfLegendToTitle(chartItem: ExtFrame) {
    return this.isGroupGraphs()! && chartItem.data?.length === 1 && (!chartItem.data[0].name || chartItem.data[0].name === chartItem.layout?.title) && allowedMergedTypes.includes(chartItem?.data[0]?.type);
  }

  inHiddenList = (metric: string) => this.isCompare() ? !this.hiddenList()?.some(m => m.startsWith(metric)) : !this.hiddenList()?.includes(metric);

  collapseGroup(groupElement: HTMLDivElement) {
    if (groupElement.classList.contains('group-collapsed')) {
      this.renderer.removeClass(groupElement, 'group-collapsed');
    } else {
      this.renderer.addClass(groupElement, 'group-collapsed');

    }
  }
}
