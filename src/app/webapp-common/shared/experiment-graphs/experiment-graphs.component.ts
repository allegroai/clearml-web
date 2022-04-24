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
import {SingleGraphComponent} from './single-graph/single-graph.component';
import {EXPERIMENT_GRAPH_ID_PREFIX, SINGLE_GRAPH_ID_PREFIX} from '../../experiments/shared/common-experiments.const';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {get, getOr} from 'lodash/fp';
import {AdminService} from '~/shared/services/admin.service';
import {GroupByCharts} from '../../experiments/reducers/common-experiment-output.reducer';
import {Store} from '@ngrx/store';
import {selectPlotlyReady} from '../../core/reducers/view.reducer';
import {ResizeEvent} from 'angular-resizable-element';
import {distinctUntilChanged, filter, map, skip, take, tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ExtFrame, ExtLegend} from './single-graph/plotly-graph-base';
import {getSignedUrl} from '../../core/actions/common-auth.actions';
import {selectSignedUrl} from '../../core/reducers/common-auth-reducer';
import {selectRouterParams} from '@common/core/reducers/router-reducer';

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
      value: GroupByCharts.Metric
    },
    {
      name: 'None',
      value: GroupByCharts.None
    }
  ];
  public groupByCharts = GroupByCharts;
  readonly EXPERIMENT_GRAPH_ID_PREFIX = EXPERIMENT_GRAPH_ID_PREFIX;
  readonly SINGLE_GRAPH_ID_PREFIX = SINGLE_GRAPH_ID_PREFIX;
  public graphList: Array<any> = [];
  public noGraphs: boolean = false;
  public graphsData: {[group: string]: any[]};
  private observer: IntersectionObserver;
  private _xAxisType: ScalarKeyEnum;
  @ViewChild('allMetrics', {static: true}) allMetrics: ElementRef;
  private visibleEntries: IntersectionObserverEntry[] = [];
  private timer: number;
  public plotlyReady$ = this.store.select(selectPlotlyReady);
  public plotlyReady: boolean;
  private subs = new Subscription();
  public height: number = 450;
  private width: number;
  private graphsPerRow: number = 2;
  private minWidth: number = 400;
  private resizeTextElement: HTMLDivElement;
  private graphsNumberLimit: number;
  public activeResizeElement: SingleGraphComponent;
  private _hiddenList: string[];

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
  @Input() legendStringLength;
  @Input() minimized: boolean;
  @Input() isDarkTheme: boolean;
  @Input() showLoaderOnDraw = true;
  @Input() legendConfiguration: Partial<ExtLegend & {noTextWrap: boolean}> = {};
  @Input() breakPoint: number = 700;
  @Input() isCompare: boolean = false;
  @Input() disableResize: boolean = false;


  @Input() smoothWeight: number;
  @Input() groupBy: GroupByCharts;
  @Input() set xAxisType(axisType: ScalarKeyEnum) {
    this._xAxisType = axisType;
    this.prepareRedraw();
  }

  get xAxisType() {
    return this._xAxisType;
  }

  @ViewChildren('metricGroup') allMetricGroups !: QueryList<ElementRef>;
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
      distinctUntilChanged()
    ).subscribe( () => {
      this.graphsData = null;
      this.graphList = [];
    }))

    this.subs.add(this.plotlyReady$.pipe(
        tap(ready => this.plotlyReady = ready),
        skip(1), // Only work on page load 1: false 2: true
        filter(ready => !!ready)
      ).subscribe(() => {
        this.prepareRedraw();
        this.graphInView(this.visibleEntries);
      })
    );
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


  @Input() set metrics(graphGroups: {[label: string]: ExtFrame[]}) {
    this.noGraphs = (graphGroups !== undefined) && (graphGroups !== null) && Object.keys(graphGroups).length === 0;
    if (!graphGroups) {
      this.graphList = [];
      return;
    }
    this.graphsData = this.sortGraphsData(graphGroups);

    this.graphsPerRow = this.allGroupsSingleGraphs() ? 1 : this.graphsPerRow;
    this.calculateGraphsLayout();

    Object.values(this.graphsData).forEach((graphs: ExtFrame[]) => {
      graphs.forEach((graph: ExtFrame) => {
        if (getOr(0, 'layout.images.length', graph) > 0) {
          graph.layout.images.forEach((image: Plotly.Image) => {
              this.store.dispatch(getSignedUrl({url: image.source, config: {skipFileServer: false, skipLocalFile: false, disableCache: graph.timestamp}}));
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

    this.observer = new IntersectionObserver(this.graphInView.bind(this), options);
    // window.setTimeout(() => this.prepareRedraw());
  }

  observeGraphs() {
    if (!this.observer) {
      return;
    }
    this.observer.takeRecords();
    const graphElements = document.querySelectorAll('sm-single-graph');
    for (const key in graphElements) {
      if (!graphElements.hasOwnProperty(key)) {
        continue;
      }
      this.observer.observe(graphElements[key]);
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
      const el = entity.target;
      const graphComponent = this.allGraphs?.find(graphComp => graphComp.identifier === el.id);
      if (this.plotlyReady && (!graphComponent?.alreadyDrawn || graphComponent?.shouldRefresh)) {
        graphComponent?.drawGraph(true);
      }
    }
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

  sortGraphsData = (data: {[label: string]: ExtFrame[]}) =>
    Object.entries(data).reduce((acc, [label, graphs]) =>
      ({...acc,
       [label]: graphs.sort((a, b) => {
         a.layout.title = a.layout.title || '';
         b.layout.title = b.layout.title || '';
         return a.layout.title === b.layout.title ?
           b.iter - a.iter :
           (a.layout.title as string).localeCompare((b.layout.title as string), undefined, {numeric: true, sensitivity: 'base'});
      })
    }), {} as {[label: string]: ExtFrame[]});

  trackByFn = (index: number, item) => item + this.xAxisType;

  trackByIdFn = (metric: string, index: number, item: ExtFrame) =>
    metric + item.layout.title + item.iter;

  isWidthBigEnough() {
    return this.el.nativeElement.clientWidth > this.breakPoint;
  }

  private allGroupsSingleGraphs() {
    return (this.isGroupGraphs || this.disableResize) && Object.values(this.graphsData).some(group => group.length === 1);
  }

  public calculateGraphsLayout(delay = 200) {
    if (this.noGraphs) {
      return;
    }
    this.timer = window.setTimeout(() => {
      if (this.allGraphs) {
        const containerWidth = this.el.nativeElement.clientWidth;
        while (containerWidth / this.graphsPerRow < this.minWidth && this.graphsPerRow > 1) {
          this.graphsPerRow -= 1;
        }
        const width = Math.floor(containerWidth / this.graphsPerRow);
        this.width = width - 16 / this.graphsPerRow;
        if (!this.isGroupGraphs) {
          this.allMetricGroups.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`));
        } else {
          this.allGraphs.forEach(singleGraph => this.renderer.setStyle(singleGraph.elementRef.nativeElement, 'width', `${this.width}px`));
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
      this.graphsPerRow = this.calcGraphPerRow(userWidth, containerWidth);

      if (!this.isGroupGraphs) {
        this.allMetricGroups.forEach(metricGroup => {
          this.width = containerWidth / this.graphsPerRow - 16 / this.graphsPerRow;
          this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`);
        });
      } else {
        this.allGraphs.forEach(singleGraph => {
          this.width = containerWidth / this.graphsPerRow - 16 / this.graphsPerRow;
          this.renderer.setStyle(singleGraph.elementRef.nativeElement, 'width', `${this.width}px`);
        });
      }
    }
    if ($event.edges.bottom) {
      this.height = $event.rectangle.height;
      if (!this.isGroupGraphs) {
        this.allMetricGroups.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'height', `${this.height}px`));
      } else {
        this.allGraphs.forEach(singleGraph => this.renderer.setStyle(singleGraph.elementRef.nativeElement, 'height', `${this.height}px`));
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

  resizeStarted(metricGroup: HTMLDivElement, singleGraph: SingleGraphComponent) {
    this.activeResizeElement = singleGraph;
    this.changeDetection.detectChanges();
    this.graphsNumberLimit = this.isGroupGraphs ? metricGroup.querySelectorAll('sm-single-graph').length : this.graphList.length;
    this.resizeTextElement = singleGraph.elementRef.nativeElement.querySelector('.whitebg.resize-active.resize-ghost-element .resize-overlay-text');
  }

  onResizing($event: ResizeEvent) {
    if ($event.edges.right && this.resizeTextElement) {
      const graphsPerRow = this.calcGraphPerRow($event.rectangle.width, this.el.nativeElement.clientWidth);
      const text = `${graphsPerRow > 1 ? graphsPerRow + ' graphs' : '1 graph'} per row`;
      this.renderer.setProperty(this.resizeTextElement, 'textContent', text);
    }
  }
}
