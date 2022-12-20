import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {sortMetricsList} from '../../tasks/tasks.utils';
import {SingleGraphComponent} from '../single-graph/single-graph.component';
import {
  ChartHoverModeEnum,
  EXPERIMENT_GRAPH_ID_PREFIX,
  SINGLE_GRAPH_ID_PREFIX
} from '../../experiments/shared/common-experiments.const';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {get, getOr} from 'lodash/fp';
import {AdminService} from '~/shared/services/admin.service';
import {GroupByCharts, groupByCharts} from '../../experiments/reducers/common-experiment-output.reducer';
import {Store} from '@ngrx/store';
import {selectPlotlyReady} from '../../core/reducers/view.reducer';
import {ResizeEvent} from 'angular-resizable-element';
import {distinctUntilChanged, filter, map, skip, take, tap} from 'rxjs/operators';
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

@Component({
  selector: 'sm-experiment-graphs',
  templateUrl: './experiment-graphs.component.html',
  styleUrls: ['./experiment-graphs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExperimentGraphsComponent implements OnDestroy {

  groupByOptions = [
    {
      name: 'Metric',
      value: groupByCharts.metric
    },
    {
      name: 'None',
      value: groupByCharts.none
    }
  ];
  public groupByCharts = groupByCharts;
  readonly experimentGraphidPrefix = EXPERIMENT_GRAPH_ID_PREFIX;
  readonly singleGraphidPrefix = SINGLE_GRAPH_ID_PREFIX;
  public graphList: Array<any> = [];
  public noGraphs: boolean = false;
  public graphsData: { [group: string]: VisibleExtFrame[] };
  public visibleGraphsData: {[graphId: string]: boolean} = {};
  private observer: IntersectionObserver;
  private _xAxisType: ScalarKeyEnum;
  @ViewChild('allMetrics', {static: true}) allMetrics: ElementRef;
  private visibleEntries: IntersectionObserverEntry[] = [];
  private timer: number;
  public plotlyReady$ = this.store.select(selectPlotlyReady);
  public plotlyReady: boolean;
  private subs = new Subscription();
  public height: number = 450;
  public width: number;
  private graphsPerRow: number;
  private minWidth: number = 350;
  private resizeTextElement: HTMLDivElement;
  private graphsNumberLimit: number;
  public activeResizeElement: any;
  private _hiddenList: string[];
  private maxUserHeight: number;
  private maxUserWidth: number;

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.timer);
    this.prepareRedraw();
    this.graphsPerRow = this.allGroupsSingleGraphs() ? 1 : this.graphsPerRow;
    this.calculateGraphsLayout();
  }

  @Input() set hiddenList(list: string[]) {
    this._hiddenList = list || [];
    window.setTimeout(() => this.calculateGraphsLayout());
  }

  get hiddenList() {
    return this._hiddenList;
  }

  @Input() isGroupGraphs: boolean;
  @Input() legendStringLength = 19;
  @Input() minimized: boolean;
  @Input() isDarkTheme: boolean;
  @Input() showLoaderOnDraw = true;
  @Input() legendConfiguration: Partial<ExtLegend & { noTextWrap: boolean }> = {};
  @Input() breakPoint: number = 700;
  @Input() isCompare: boolean = false;
  @Input() hoverMode: ChartHoverModeEnum;
  @Input() disableResize: boolean = false;
  @Input() singleValueData: Array<EventsGetTaskSingleValueMetricsResponseValues>;
  @Input() experimentName: string;


  @Input() smoothWeight: number;
  @Input() groupBy: GroupByCharts;

  @Input() set xAxisType(axisType: ScalarKeyEnum) {
    this._xAxisType = axisType;
    this.prepareRedraw();
  }

  get xAxisType() {
    return this._xAxisType;
  }

  @Input() exportForReport = true;
  @Output() hoverModeChanged = new EventEmitter<ChartHoverModeEnum>();
  @Output() createEmbedCode = new EventEmitter<{metrics?: string[]; variants?: string[]}>();

  @ViewChildren('metricGroup') allMetricGroups !: QueryList<ElementRef>;
  @ViewChildren('singleGraphContainer') singleGraphs !: QueryList<ElementRef>;
  @ViewChildren(SingleGraphComponent) allGraphs !: QueryList<SingleGraphComponent>;

  constructor(
    private el: ElementRef,
    private changeDetection: ChangeDetectorRef,
    private adminService: AdminService,
    private store: Store<any>,
    private renderer: Renderer2
  ) {

    this.subs.add(this.store.select(selectRouterParams).pipe(
      map(params => get('experimentId', params)),
      distinctUntilChanged(),
      skip(1) // don't need first null->expId
    ).subscribe(() => {
      this.store.dispatch(setGraphsPerRow({graphsPerRow: 2}));
      this.graphsData = null;
      this.graphList = [];
      this.visibleGraphsData = {};
    }));

    this.subs.add(this.plotlyReady$.pipe(
        tap(ready => this.plotlyReady = ready),
        skip(1), // Only work on page load 1: false 2: true
        filter(ready => !!ready)
      ).subscribe(() => {
        this.prepareRedraw();
        this.graphInView(this.visibleEntries);
      })
    );
    this.subs.add(this.store.select(selectGraphsPerRow).subscribe(graphsPerRow => this.graphsPerRow = graphsPerRow));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.allMetricGroups = null;
    this.graphsPerRow = null;
  }

  @Output() resetGraphs = new EventEmitter();

  @Input() set splitSize(splitSize: number) {
    this.calculateGraphsLayout();
  }


  @Input() set metrics(graphGroups: { [label: string]: ExtFrame[] }) {
    this.noGraphs = (graphGroups !== undefined) && (graphGroups !== null) && Object.keys(graphGroups).length === 0;
    if (!graphGroups) {
      this.graphList = [];
      return;
    }
    this.graphsData = this.addId(this.sortGraphsData(graphGroups));

    this.graphsPerRow = (this.disableResize || this.allGroupsSingleGraphs()) ? 1 : this.graphsPerRow;
    this.maxUserHeight = Math.max(...Object.values(this.graphsData).flat().map((chart: ExtFrame) => chart.layout?.height || 0));
    this.maxUserWidth = Math.max(...Object.values(this.graphsData).flat().map((chart: ExtFrame) => chart.layout?.width || 0));
    if (this.maxUserHeight) {
      this.height = this.maxUserHeight;
    }
    this.calculateGraphsLayout(0);

    Object.values(this.graphsData).forEach((graphs: ExtFrame[]) => {
      graphs.forEach((graph: ExtFrame) => {
        if (getOr(0, 'layout.images.length', graph) > 0) {
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
    this.graphList = sortMetricsList(Object.keys(graphGroups));
    this.changeDetection.detectChanges(); // forcing detectChanges for the intersection observer
    const options = {
      root: this.allMetrics.nativeElement,
      rootMargin: '0px',
      threshold: 0.1
    };

    window.setTimeout(() => {
      this.observer = new IntersectionObserver(entries => this.graphInView(entries), options);
      this.observeGraphs();
    }, 50);
  }


  observeGraphs() {
    if (!this.observer) {
      return;
    }
    this.observer.takeRecords();
    const graphElements = this.singleGraphs;
    for (const singleGraphEl of graphElements) {
      this.observer.observe(singleGraphEl.nativeElement);
    }
  }

  private prepareRedraw() {
    if (!this.allGraphs) {
      return;
    }
    this.allGraphs.forEach(graph => graph.shouldRefresh = true);
    this.observeGraphs();
  }

  graphInView(entries: IntersectionObserverEntry[] = []) {
    this.maintainVisibleEntries(entries);
    for (const entity of entries) {
      if (entity.intersectionRatio === 0) {
        continue;
      }
      const el = entity.target as HTMLElement;
      const singleGraphComponent = this.allGraphs?.find(graphComp => graphComp.identifier === el.id);
      if (this.plotlyReady && (!singleGraphComponent?.alreadyDrawn || singleGraphComponent?.shouldRefresh)) {
        const currentGraphData = Object.values(this.graphsData).flat(1).find(g => g.id === el.id);
        if (currentGraphData) {
          currentGraphData.visible = true;
          this.visibleGraphsData[this.generateIdentifier(currentGraphData)] = true;

        }
      }
    }
    this.changeDetection.detectChanges();
  }

  private maintainVisibleEntries(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!this.visibleEntries.includes(entry)) {
          this.visibleEntries.push(entry);
        }
      } else {
        this.visibleEntries = this.visibleEntries.filter(visEntry => visEntry.target !== entry.target);
      }
    });
  }

  sortGraphsData = (data: { [label: string]: ExtFrame[] }) =>
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
      }), {} as { [label: string]: ExtFrame[] });

  trackByFn = (index: number, item) => item + this.xAxisType;

  trackByIdFn = (index: number, item: ExtFrame) =>
    `${item.layout.title} ${(this.isDarkTheme ? '' : item.iter)}`;

  isWidthBigEnough() {
    return this.el.nativeElement.clientWidth > this.breakPoint;
  }

  private allGroupsSingleGraphs() {
    return (this.isGroupGraphs || this.disableResize) && Object.values(this.graphsData || {}).every(group => group.length === 1);
  }

  public calculateGraphsLayout(delay = 200) {
    if (this.noGraphs) {
      return;
    }
    this.timer = window.setTimeout(() => {
      if (this.allGraphs) {
        const containerWidth = this.el.nativeElement.clientWidth;
        while (containerWidth / this.graphsPerRow < this.minWidth && this.graphsPerRow > 1 || containerWidth / this.graphsPerRow < this.maxUserWidth) {
          this.graphsPerRow -= 1;
        }
        const width = Math.floor(containerWidth / this.graphsPerRow);
        this.width = width - 16 / this.graphsPerRow;
        this.height = this.maxUserHeight || this.height;
        if (!this.isGroupGraphs) {
          this.allMetricGroups.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`));
          this.allMetricGroups.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'height', `${this.height}px`));
        } else {
          this.singleGraphs.forEach(singleGraph => this.renderer.setStyle(singleGraph.nativeElement, 'width', `${this.width}px`));
          this.singleGraphs.forEach(singleGraph => this.renderer.setStyle(singleGraph.nativeElement, 'height', `${this.height}px`));
        }
      }
      this.prepareRedraw();
      this.graphInView(this.visibleEntries);
    }, delay);
  }

  sizeChanged($event: ResizeEvent) {
    this.activeResizeElement = null;
    if ($event.edges.right) {
      const containerWidth = this.el.nativeElement.clientWidth;
      const userWidth = $event.rectangle.width;
      this.store.dispatch(setGraphsPerRow({graphsPerRow: this.calcGraphPerRow(userWidth, containerWidth)}));

      if (!this.isGroupGraphs) {
        this.allMetricGroups.forEach(metricGroup => {
          this.width = containerWidth / this.graphsPerRow - 16 / this.graphsPerRow - 2;
          this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`);
        });
      } else {
        this.singleGraphs.forEach(singleGraph => {
          this.width = containerWidth / this.graphsPerRow - 16 / this.graphsPerRow - 2;
          this.renderer.setStyle(singleGraph.nativeElement, 'width', `${this.width}px`);
        });
      }
    }
    if ($event.edges.bottom) {
      this.height = $event.rectangle.height;
      if (!this.isGroupGraphs) {
        this.allMetricGroups.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'height', `${this.height}px`));
      } else {
        this.singleGraphs.forEach(singleGraph => this.renderer.setStyle(singleGraph.nativeElement, 'height', `${this.height}px`));
      }
    }
    this.prepareRedraw();
    setTimeout(() => this.graphInView(this.visibleEntries));
  }

  private calcGraphPerRow(userWidth: number, containerWidth: number) {
    let graphsPerRow;
    if (userWidth > 0.75 * containerWidth) {
      graphsPerRow = 1;
    } else if (userWidth > 0.33 * containerWidth) {
      graphsPerRow = 2;
    } else {
      graphsPerRow = Math.floor(containerWidth / userWidth);
    }
    return Math.min(graphsPerRow, this.graphsNumberLimit);
  }

  resizeStarted(metricGroup: HTMLDivElement, singleGraph?: any) {
    this.activeResizeElement = singleGraph;
    this.changeDetection.detectChanges();
    this.graphsNumberLimit = this.isGroupGraphs ? metricGroup.querySelectorAll(':not(.resize-ghost-element) > sm-single-graph').length : this.graphList.length;
    this.resizeTextElement = singleGraph?.parentElement.querySelectorAll('.resize-overlay-text')[1];
  }

  onResizing($event: ResizeEvent) {
    if ($event.edges.right && this.resizeTextElement) {
      const graphsPerRow = this.calcGraphPerRow($event.rectangle.width, this.el.nativeElement.clientWidth);
      const text = `${graphsPerRow > 1 ? graphsPerRow + ' graphs' : '1 graph'} per row`;
      this.renderer.setProperty(this.resizeTextElement, 'textContent', text);
    }
  }

  validateResize($event: ResizeEvent): boolean {
    return $event.rectangle.width > 350 && $event.rectangle.height > 250;
  }

  scrollToGraph(id: string) {
    const element = this.allMetrics.nativeElement.getElementsByClassName('graph-id')[EXPERIMENT_GRAPH_ID_PREFIX + id] as HTMLDivElement;
    if (element) {
      this.allMetrics.nativeElement.scrollTo({top: element.offsetTop, behavior: 'smooth'});
    }
  }


  private addId(sortGraphsData1: { [p: string]: ExtFrame[] }): { [p: string]: VisibleExtFrame[] } {
    return Object.entries(sortGraphsData1).reduce((acc, [label, graphs]) =>
      ({
        ...acc,
        [label]: graphs.map((graph) => ({...graph, id: v4(), visible: this.visibleGraphsData[this.generateIdentifier(graph)]}))
      }), {} as { [label: string]: VisibleExtFrame[] });
  }

  public generateIdentifier = (chartItem: any) => `${this.singleGraphidPrefix} ${this.experimentGraphidPrefix} ${chartItem.metric} ${chartItem.layout.title} ${chartItem.iter} ${chartItem.variant} ${(chartItem.layout.images && chartItem.layout.images[0]?.source)}`;

  creatingEmbedCode(chartItem: any) {
    this.createEmbedCode.emit({metrics: [chartItem.metric], variants: [chartItem.variant]});
  }
}
