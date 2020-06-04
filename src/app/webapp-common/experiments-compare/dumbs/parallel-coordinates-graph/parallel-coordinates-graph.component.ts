import {ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {PlotlyGraphBase} from '../../../shared/experiment-graphs/single-graph/plotly-graph-base';
import {debounceTime, filter} from 'rxjs/operators';
import {ColorHashService} from '../../../shared/services/color-hash/color-hash.service';
import {get, isEqual, max, min, uniq, cloneDeep} from 'lodash/fp';
import {MetricValueType, SelectedMetric} from '../../reducers/experiments-compare-charts.reducer';
import {Task} from '../../../../business-logic/model/tasks/task';
import {select} from 'd3-selection';

declare let Plotly;

interface ExtraTask extends Task {
  duplicateName: boolean;
  hidden: boolean;
}

@Component({
  selector: 'sm-parallel-coordinates-graph',
  templateUrl: './parallel-coordinates-graph.component.html',
  styleUrls: ['./parallel-coordinates-graph.component.scss']
})
export class ParallelCoordinatesGraphComponent extends PlotlyGraphBase implements OnInit {

  private data: { line: { color: Task[]; colorscale: (number | string)[][] }; type: string; dimensions: unknown[] }[];
  private _experiments: ExtraTask[];
  private _metric: SelectedMetric;
  public experimentsColors = {};
  public filteredExperiments = [];
  private timer: NodeJS.Timer;
  private _parameters: string[];

  @ViewChild('parallelGraph', {static: true}) parallelGraph: ElementRef;
  private graphWidth: any;
  private _metricValueType: MetricValueType;

  @HostListener('window:resize')
  redrawChart() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.drawChart(), 75);
  }

  @Input() set metricValueType(metricValueType: MetricValueType) {
    this._metricValueType = metricValueType;
    if (this.experiments) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.prepareGraph(), 200);
    }
  }

  get metricValueType() {
    return this._metricValueType;
  }

  @Input() set metric(metric) {
    if (metric != this.metric) {
      this._metric = metric;
      if (this.experiments) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.prepareGraph(), 200);
      }
    }
  }

  get metric(): SelectedMetric {
    return this._metric;
  }

  @Input() set parameters(parameters) {
    if (!isEqual(parameters, this.parameters)) {
      this._parameters = parameters;
      if (this.experiments) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.prepareGraph(), 200);
      }
    }
  }

  get parameters(): string[] {
    return this._parameters;
  }


  @Input() set experiments(experiments) {
    let experimentsCopy = cloneDeep(experiments);
    if (experimentsCopy && (!this.experiments || !isEqual(experimentsCopy.map(experiment => experiment.id), this.experiments.map(experiment => experiment.id)))) {

      const experimentsNames = experimentsCopy.map(experiment => experiment.name);
      experimentsCopy = experimentsCopy.map(experiment => ({
        ...experiment,
        duplicateName: experimentsNames.filter(name => name === experiment.name).length > 1,
        hidden: this.filteredExperiments.includes(experiment.id)
      }));
      this._experiments = experimentsCopy;
      if (experimentsCopy) {
        this.prepareGraph();
      }
    }
  }


  get experiments(): ExtraTask[] {
    return this._experiments;
  }

  private initColorSubscription(forceRedraw = false): void {
    if (this.colorSub) {
      // Subscription is already running
      if (forceRedraw) {
        this.colorSub.unsubscribe();
      } else {
        return;
      }
    }
    this.colorSub = this.colorHash.getColorsObservable()
      .pipe(
        filter(colorObj => !!colorObj),
        debounceTime(100)
      )
      .subscribe(() => {
        this.prepareGraph();
      });
  }

  constructor(
    public renderer: Renderer2,
    public colorHash: ColorHashService,
    public changeDetector: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.initColorSubscription();
  }

  toggleHideExperiment(experimentId): void {
    if (this.filteredExperiments.includes(experimentId)) {
      this.filteredExperiments = this.filteredExperiments.filter(id => id !== experimentId);
    } else {
      this.filteredExperiments.push(experimentId);
    }
    this._experiments = this.experiments.map(experiment => ({...experiment, hidden: this.filteredExperiments.includes(experiment.id)}));
    this.prepareGraph();
  }

  getStringColor(name): string {
    const colorArr = this.colorHash.initColor(name);
    return `rgb(${colorArr[0]},${colorArr[1]},${colorArr[2]})`;
  }

  getColorsArray(experiments): Task[] {
    return experiments.map((experiment, index) => (index === (experiments.length - 1)) ? 1.0 : index / 10);
  }

  private prepareGraph(): void {
    this.experiments.forEach(experiment => this.experimentsColors[experiment.id] = this.getStringColor(experiment.id));
    const filteredExperiments = this.experiments.filter(experiment => !this.filteredExperiments.includes(experiment.id));
    if (this.parameters && filteredExperiments.length > 0) {
      const trace: any = {
        type: 'parcoords',
        dimensions: this.parameters.map((parameter) => {
          const dimension: any = {};
          const allValuesIncludingNull = filteredExperiments.map(experiment => experiment.execution.parameters[parameter]);
          const allValues = allValuesIncludingNull.filter(value => (value !== undefined)).filter(value => (value !== ''));
          dimension.label = parameter;
          const textVal: any = {};
          dimension.ticktext = this.naturalCompare(uniq(allValues).filter(text => text !== ''));
          (allValuesIncludingNull.length > allValues.length) && (dimension.ticktext = ['N/A'].concat(dimension.ticktext));
          dimension.tickvals = dimension.ticktext.map((text, index) => {
            textVal[text] = index;
            return index;
          });
          dimension.values = filteredExperiments.map((experiment) => (textVal[['', undefined].includes(experiment.execution.parameters[parameter]) ? 'N/A' : experiment.execution.parameters[parameter]]));
          dimension.range = [0, max(dimension.tickvals)];
          return dimension;
        })
      };
      if (filteredExperiments.length > 1) {
        trace.line = {
          color: this.getColorsArray(filteredExperiments),
          colorscale: filteredExperiments.map((experiment, index) => [index === filteredExperiments.length - 1 ? 1.0 : index / 10, this.getStringColor(experiment.id)])
        };
      } else {
        trace.line = {
          color: this.getStringColor(filteredExperiments[0].id)
        };
      }

      // this is to keep the metric last in html so that bold scss will take place.
      // this.data = [trace];
      // this.drawChart();

      if (this.metric) {
        const metricDimension: any = {};
        const allValuesIncludingNull = filteredExperiments.map(experiment => get(`${this.metric.path}.${this.metricValueType}`, experiment.last_metrics));
        const allValues = allValuesIncludingNull.filter(value => value !== undefined);
        const NAVal = this.getNAValue(allValues);
        metricDimension.label = this.metric.name;
        metricDimension.ticktext = uniq(allValuesIncludingNull.map(value => value !== undefined ? value : 'N/A'));
        metricDimension.tickvals = metricDimension.ticktext.map(text => text === 'N/A' ? NAVal : text);
        metricDimension.values = filteredExperiments.map((experiment) => get(`${this.metric.path}.${this.metricValueType}`, experiment.last_metrics) === undefined ? NAVal :
          parseFloat(get(`${this.metric.path}.${this.metricValueType}`, experiment.last_metrics)));
        trace.dimensions.push(metricDimension);
      }
      this.data = [trace];
      this.drawChart();
    }
  }

  private getNAValue(values: Array<number>): number {
    if (!(values.length > 0)) {
      return 0;
    }
    const valuesMax = max(values);
    const valuesMin = min(values);
    return valuesMax === valuesMin ? (valuesMin - 1) : valuesMin - ((valuesMax - valuesMin) / 10);
  }

  private drawChart() {
    Plotly.react(this.parallelGraph.nativeElement, this.data, {
      margin: {l: 120, r: 120},
      height: 500,
      width: this.parallelGraph.nativeElement.offsetWidth
    }, {
      'displaylogo': false,
      'displayModeBar': false,
      modeBarButtonsToRemove: ['toggleHover']
    });
    this.postRenderingGraphManipulation();
  }

  private postRenderingGraphManipulation() {
    if (this.parameters) {
      const graph = select(this.parallelGraph.nativeElement);
      this.graphWidth = graph.node().getBoundingClientRect().width;
      graph.selectAll('.y-axis').each((d, index, element) => {
        if ((d as any).key === this.metric.name) {
          select(element[index]).attr('class', 'y-axis metric-column');
        }
      });
      graph.selectAll('.axis-title').text((d: any) => this.wrap(d.key)).append('title').text(d => (d as any).key);
      graph.selectAll('.axis .tick text').text((d: string) => this.wrap(d)).append('title').text((d: string) => d);
      graph.selectAll('.axis .tick text').style('pointer-events', 'auto');
      graph.selectAll('.tick').on('mouseover', (d, i, j) => {
        const tick = select(j[i]).node() as SVGGElement;
        const axis = tick.parentNode as SVGGElement;
        if (axis.lastChild !== tick) {
          axis.removeChild(tick);
          axis.appendChild(tick);
        }
      });
    }
  }

  wrap(key) {
    key = key.toString();
    const short = (key.slice(0, ((this.graphWidth / this.parameters.length) - 20) / 6));
    return short + (key.length > short.length ? '...' : '');
  }

  private naturalCompare(myArray) {
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    return (myArray.sort(collator.compare));
  }
}
