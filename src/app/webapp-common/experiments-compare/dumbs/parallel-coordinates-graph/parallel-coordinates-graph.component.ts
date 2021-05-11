import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {PlotlyGraphBase} from '../../../shared/experiment-graphs/single-graph/plotly-graph-base';
import {debounceTime, filter} from 'rxjs/operators';
import {ColorHashService} from '../../../shared/services/color-hash/color-hash.service';
import {get, getOr, isEqual, max, min, uniq, cloneDeep} from 'lodash/fp';
import {MetricValueType, SelectedMetric} from '../../reducers/experiments-compare-charts.reducer';
import {Task} from '../../../../business-logic/model/tasks/task';
import {select} from 'd3-selection';
import {sortCol} from '../../../shared/utils/tableParamEncode';
import {Store} from '@ngrx/store';
import {Axis, Color, ColorScale} from 'plotly.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let Plotly;

interface ExtraTask extends Task {
  duplicateName: boolean;
  hidden: boolean;
}

interface Dimension extends Partial<Axis> {
  label: string;
  values: number[];
  constraintrange;
}

interface ParaPlotData {
  type: string;
  dimensions: Dimension[];
  line: {
    color: Color;
    colorscale?: ColorScale;
  };
}

@Component({
  selector: 'sm-parallel-coordinates-graph',
  templateUrl: './parallel-coordinates-graph.component.html',
  styleUrls: ['./parallel-coordinates-graph.component.scss']
})
export class ParallelCoordinatesGraphComponent extends PlotlyGraphBase implements OnInit {

  private data: ParaPlotData[];
  private _experiments: ExtraTask[];
  private _metric: SelectedMetric;
  public experimentsColors = {};
  public filteredExperiments = [];
  private timer: NodeJS.Timer;
  private _parameters: string[];

  @ViewChild('parallelGraph', {static: true}) parallelGraph: ElementRef;
  private graphWidth: any;
  private _metricValueType: MetricValueType;
  private highlighted: ExtraTask;
  private dimensionsOrder: string[];

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
    private colorHash: ColorHashService,
    protected store: Store
  ) {
    super(store);
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

  getStringColor(experiment: ExtraTask): string {
    const colorArr = this.colorHash.initColor(this.getExperimentNameForColor(experiment));
    return `rgb(${colorArr[0]},${colorArr[1]},${colorArr[2]})`;
  }

  getExperimentNameForColor(experiment): string {
    return `${experiment.name}-${experiment.id}`;
  }

  getColorsArray(experiments): number[] {
    return experiments.map((experiment, index) => index / (experiments.length - 1));
  }

  private prepareGraph(): void {
    this.experiments.forEach(experiment => this.experimentsColors[experiment.id] = this.getStringColor(experiment));
    const filteredExperiments = this.experiments.filter(experiment => !experiment.hidden);
    if (this.parameters && filteredExperiments.length > 0) {
      const trace = {
        type: 'parcoords',
        dimensions: this.parameters.map((parameter) => {
          parameter = `${parameter}.value`;
          const allValuesIncludingNull = this.experiments.map(experiment => get(parameter, experiment.hyperparams));
          const allValues = allValuesIncludingNull.filter(value => (value !== undefined)).filter(value => (value !== ''));
          const textVal: any = {};
          let ticktext = this.naturalCompare(uniq(allValues).filter(text => text !== ''));
          (allValuesIncludingNull.length > allValues.length) && (ticktext = ['N/A'].concat(ticktext));
          const tickvals = ticktext.map((text, index) => {
            textVal[text] = index;
            return index;
          });
          let constraintrange;
          if (this.parallelGraph.nativeElement?.data?.[0]?.dimensions) {
            const currDimention = this.parallelGraph.nativeElement.data[0].dimensions.find(d => d.label === parameter);
            if (currDimention?.constraintrange) {
              constraintrange = currDimention.constraintrange;
            }
          }
          return {
            label: parameter,
            ticktext,
            tickvals,
            values: filteredExperiments.map((experiment) => (textVal[['', undefined].includes(get(parameter, experiment.hyperparams)) ? 'N/A' : get(parameter, experiment.hyperparams)])),
            range: [0, max(tickvals)],
            constraintrange
          };
        })
      } as ParaPlotData ;
      if (filteredExperiments.length > 1) {
        trace.line = {
          color: this.getColorsArray(filteredExperiments),
          colorscale: filteredExperiments.map((experiment, index) =>
            [index / (filteredExperiments.length - 1), this.getStringColor(experiment)] as [number, string]),
        };
      } else {
        trace.line = {
          color: this.getStringColor(filteredExperiments[0])
        };
      }

      // this is to keep the metric last in html so that bold scss will take place.
      // this.data = [trace];
      // this.drawChart();

      if (this.metric) {
        const allValuesIncludingNull = this.experiments.map(experiment => get(`${this.metric.path}.${this.metricValueType}`, experiment.last_metrics));
        const allValues = allValuesIncludingNull.filter(value => value !== undefined);
        const naVal = this.getNAValue(allValues);
        const ticktext = uniq(allValuesIncludingNull.map(value => value !== undefined ? value : 'N/A'));
        const tickvals = ticktext.map(text => text === 'N/A' ? naVal : text);
        let constraintrange;
        if (this.parallelGraph.nativeElement?.data?.[0]?.dimensions) {
          const currDimention = this.parallelGraph.nativeElement.data[0].dimensions.find(d => d.label === this.metric.name);
          if (currDimention?.constraintrange) {
            constraintrange = currDimention.constraintrange;
          }
        }
        trace.dimensions.push({
          label: this.metric.name,
          ticktext,
          tickvals,
          values: filteredExperiments.map((experiment) =>
            parseFloat(getOr(naVal, `${this.metric.path}.${this.metricValueType}`, experiment.last_metrics))
          ),
          range: [min(tickvals), max(tickvals)],
          constraintrange
        });
      }
      this.data = [trace];
      if (this.dimensionsOrder) {
        this.data[0].dimensions.sort((a, b) => sortCol(a.label, b.label, this.dimensionsOrder));
      }
      this.drawChart();
    }
  }

  private getNAValue(values: Array<number>): number {
    if (!(values.length > 0)) {
      return 0;
    }
    const valuesMax = max(values);
    const valuesMin = min(values);
    return valuesMax === valuesMin ? (valuesMin - 1) : valuesMin - ((valuesMax - valuesMin) / values.length);
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
      graph.selectAll('.tick').on('mouseover', (event, d) => {
        const tick = d as unknown as SVGGElement;
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
    const compare = (a: string, b: string) => {
      const aFloat = parseFloat(a);
      const bFloat = parseFloat(b);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        return aFloat - bFloat;
      }
      return collator.compare(a, b);
    };

    return (myArray.sort(compare));

  }

  highlightExperiment(experiment: ExtraTask) {
    if (this.highlighted?.id != experiment?.id) {
      this.highlighted = experiment;
      this.dimensionsOrder = this.parallelGraph.nativeElement.data?.[0].dimensions.map(d => d.label);
      this._experiments = this.experiments.map(exp => ({...exp, hidden: exp.id !== experiment.id}));
      this.prepareGraph();
    }
  }

  removeHighlightExperiment() {
    this.highlighted = null;
    this._experiments = this.experiments.map(experiment => ({...experiment, hidden: this.filteredExperiments.includes(experiment.id)}));
    this.prepareGraph();
    this.dimensionsOrder = null;
  }
}
