import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {sortMetricsList} from '../../tasks/tasks.utils';
import {SingleGraphComponent} from './single-graph/single-graph.component';
import {EXPERIMENT_GRAPH_ID_PREFIX, SINGLE_GRAPH_ID_PREFIX} from '../../experiments/shared/common-experiments.const';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {getOr} from 'lodash/fp';
import {AdminService} from '../../../features/admin/admin.service';
import {GroupByCharts} from '../../experiments/reducers/common-experiment-output.reducer';
import {Store} from '@ngrx/store';
import {selectPlotlyReady} from '../../core/reducers/view-reducer';
import {ResizeEvent} from 'angular-resizable-element';
import {filter, skip, tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'sm-experiment-graphs',
  templateUrl: './experiment-graphs.component.html',
  styleUrls: ['./experiment-graphs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExperimentGraphsComponent {

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
  public graphsData: any;
  private observer: IntersectionObserver;
  private _smoothWeight: any;
  private _xAxisType: ScalarKeyEnum;
  @ViewChild('allMetrics', {static: true}) allMetrics: ElementRef;
  private visibleEntries: IntersectionObserverEntry[] = [];
  private timer: number;
  public plotlyReady$ = this.store.select(selectPlotlyReady);
  public plotlyReady: boolean;
  private plotlyReadySub: Subscription;
  public height: number = 450;
  private width: number;
  private graphsPerRow: number = 2;
  private minWidth: number = 400;
  private resizeTextElement: HTMLDivElement;
  private graphsNumberLimit: number;
  public activeResizeElement: SingleGraphComponent;

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.timer);
    this.prepareRedraw();
    this.timer = window.setTimeout(() => {
      this.calculateGraphsLayout();
    }, 200);
  }

  @Input() hiddenList: Array<string> = [];
  @Input() isGroupGraphs: boolean;
  @Input() legendStringLength;
  @Input() minimized: boolean;
  @Input() breakPoint: number = 700;
  @Input() isCompare: boolean = false;


  @Input() set smoothWeight(smooth: number) {
    this._smoothWeight = smooth;
  }

  get smoothWeight() {
    return this._smoothWeight;
  }

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
    this.plotlyReadySub = this.plotlyReady$.pipe(
      tap(ready => this.plotlyReady = ready),
      skip(1), // Only work on page load 1: false 2: true
      filter(ready => !!ready)).subscribe(() => {
      this.prepareRedraw();
      this.graphInView(this.visibleEntries);
    });
  }

  @Output() resetGraphs = new EventEmitter();
  @Output() changeWeight = new EventEmitter<number>();
  @Output() changeXAxisType = new EventEmitter<ScalarKeyEnum>();
  @Output() changeGroupBy = new EventEmitter<GroupByCharts>();
  @Output() toggleSettings = new EventEmitter();

  @Input() set splitSize(splitSize: number) {
    this.calculateGraphsLayout();
  }

  @Input() showSettings: boolean = false;

  @Input() set metrics(graphs) {
    this.noGraphs = (graphs !== undefined) && (graphs !== null) && Object.keys(graphs).length === 0;
    if (!graphs) {
      this.graphList = [];
      return;
    }
    this.graphsData = this.sortGraphsData(graphs);
    Object.values(this.graphsData).forEach((graphs: any[]) => {
      graphs.forEach((graph: Plotly.Frame) => {
        if (getOr(0, 'layout.images.length', graph) > 0) {
          graph.layout.images.forEach((image: Plotly.Image) => image.source = this.adminService.signUrlIfNeeded(image.source, false, false));
        }
      });
    });
    this.graphList = sortMetricsList(Object.keys(graphs));
    this.changeDetection.detectChanges(); // forcing detectChanges for the intersection observer
    const options = {
      root: this.allMetrics.nativeElement,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver(this.graphInView.bind(this), options);
    this.prepareRedraw();                                     // to apply on updated graphs

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

  graphInView(entries: IntersectionObserverEntry[]) {
    this.maintainVisibleEntries(entries);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].intersectionRatio === 0) {
        continue;
      }
      const el = entries[i].target;
      const graphComponent = this.allGraphs.find(graphComp => graphComp.identifier === el.id);
      if (this.plotlyReady && (!graphComponent?.alreadyDrawn || graphComponent?.shouldRefresh)) {
        graphComponent.drawGraph(true);
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

  sortGraphsData(data) {
    const dataCopy = {};
    for (const key in data) {
      dataCopy[key] = data[key].sort((a, b) => {
        a.layout.title = a.layout.title || '';
        b.layout.title = b.layout.title || '';
        return a.layout.title === b.layout.title ? b.iter - a.iter : a.layout.title.localeCompare(b.layout.title, undefined, {numeric: true, sensitivity: 'base'});
      });
    }
    return dataCopy;
  }

  trackByFn(index, item) {
    return item;
  }

  trackByIdFn(metric, index, item) {
    return metric + item.layout.title + item.iter;
  }

  isWidthBigEnough() {
    return this.el.nativeElement.clientWidth > this.breakPoint;
  }

  private calculateGraphsLayout() {
    if (this.allGraphs) {
      const containerWidth = this.el.nativeElement.clientWidth;
      while (containerWidth / this.graphsPerRow < this.minWidth && this.graphsPerRow > 1) {
        this.graphsPerRow -= 1;
      }
      const width = Math.floor(containerWidth / this.graphsPerRow);
      this.width = width - 4;
      if (!this.isGroupGraphs) {
        this.allMetricGroups.forEach(metricGroup => this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`));
      } else {
        this.allGraphs.forEach(singleGraph => this.renderer.setStyle(singleGraph.elementRef.nativeElement, 'width', `${this.width}px`));
      }
    }
    this.prepareRedraw();
    this.graphInView(this.visibleEntries);
  }

  sizeChanged($event: ResizeEvent) {
    this.activeResizeElement = null;
    if ($event.edges.right) {
      const containerWidth = this.el.nativeElement.clientWidth;
      const userWidth = $event.rectangle.width;
      this.graphsPerRow = Math.min(Math.floor(containerWidth / userWidth), this.graphsNumberLimit);

      if (!this.isGroupGraphs) {
        this.allMetricGroups.forEach(metricGroup => {
          this.width = containerWidth / this.graphsPerRow - 4;
          this.renderer.setStyle(metricGroup.nativeElement, 'width', `${this.width}px`);
        });
      } else {
        this.allGraphs.forEach(singleGraph => {
          this.width = containerWidth / this.graphsPerRow - 4;
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

  resizeStarted(metricGroup: HTMLDivElement, singleGraph: SingleGraphComponent) {
    this.activeResizeElement = singleGraph;
    this.changeDetection.detectChanges();
    this.graphsNumberLimit = this.isGroupGraphs ? metricGroup.querySelectorAll('sm-single-graph').length : this.graphList.length;
    this.resizeTextElement = singleGraph.elementRef.nativeElement.querySelector('.whitebg.resize-active.resize-ghost-element .resize-overlay-text');
  }

  onResizing($event: ResizeEvent) {
    if ($event.edges.right) {
      const graphsPerRow = Math.min(Math.floor(this.el.nativeElement.clientWidth / $event.rectangle.width), this.graphsNumberLimit);
      const text = `${graphsPerRow > 1 ? graphsPerRow + ' graphs' : '1 graph'} per row`;
      this.renderer.setProperty(this.resizeTextElement, 'textContent', text);
    }
  }
}
