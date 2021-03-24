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

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.timer);
    this.prepareRedraw();
    this.timer = window.setTimeout(() => {
      this.graphInView(this.visibleEntries);
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

  @ViewChildren(SingleGraphComponent) allGraphs !: QueryList<SingleGraphComponent>;

  constructor(
    private el: ElementRef,
    private changeDetection: ChangeDetectorRef,
    private adminService: AdminService,
    private store: Store<any>
  ) {}

  @Output() resetGraphs = new EventEmitter();
  @Output() changeWeight = new EventEmitter<number>();
  @Output() changeXAxisType = new EventEmitter<ScalarKeyEnum>();
  @Output() changeGroupBy = new EventEmitter<GroupByCharts>();
  @Output() toggleSettings = new EventEmitter();

  @Input() set splitSize(splitSize: number) {
    this.prepareRedraw();
    setTimeout(() => this.graphInView(this.visibleEntries));
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
      if (!graphComponent?.alreadyDrawn || graphComponent?.shouldRefresh) {
        graphComponent.drawGraph(true);
      }
    }
  }

  private maintainVisibleEntries(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.visibleEntries.push(entry);
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
}
