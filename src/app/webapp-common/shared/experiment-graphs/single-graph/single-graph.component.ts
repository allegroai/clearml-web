import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild} from '@angular/core';
import {ColorHashService} from '../../services/color-hash/color-hash.service';
import {chooseTimeUnit, wordWrap} from '../../../tasks/tasks.utils';
import {attachColorChooser} from '../../ui-components/directives/choose-color/choose-color.directive';
import {debounceTime, filter} from 'rxjs/operators';
import {cloneDeep, escape, getOr, get} from 'lodash/fp';
import {AxisType, Config, Data, ModeBarDefaultButtons, Root, Margin, Datum, PlotData} from 'plotly.js';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';
import {ExtFrame, ExtLayout, PlotlyGraphBase} from './plotly-graph-base';
import {Store} from '@ngrx/store';

declare const Plotly;

@Component({
  selector: 'sm-single-graph',
  templateUrl: './single-graph.component.html',
  styleUrls: ['./single-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleGraphComponent extends PlotlyGraphBase {
  public alreadyDrawn: boolean = false;
  private originalChart: ExtFrame;
  private _chart: ExtFrame;
  private smoothnessTimeout: number;
  private chart_data: any;
  public shouldRefresh: boolean = false;
  private yaxisType: AxisType = 'linear';
  public type: PlotData['type'] | 'table';
  private previousOffsetWidth: number;

  @Input() identifier: string;

  @Input() set chart(chart) {
    this.originalChart = cloneDeep(chart);
    this._chart = chart;
  }

  get chart() {
    return this._chart;
  }

  @Input() legendStringLength: number;
  @Input() xAxisType: ScalarKeyEnum;

  @Input() set smoothWeight(ratio: number) {
    if (ratio > 0) {
      this.isSmooth = true;
    } else {
      this.isSmooth = false;
    }
    if (this.alreadyDrawn) {
      clearTimeout(this.smoothnessTimeout);
      this.smoothnessTimeout = window.setTimeout(() => {
          this._chart = cloneDeep(this.originalChart);
          this.drawGraph(true);
        }
        , 400);
    }
    this._smoothWeight = ratio;
  }

  get smoothWeight() {
    return this._smoothWeight;
  }

  @ViewChild('drawHere', {static: true}) singleGraphContainer: ElementRef;
  private chartElm: any;
  private _smoothWeight: number;


  constructor(
    protected renderer: Renderer2,
    private colorHash: ColorHashService,
    private changeDetector: ChangeDetectorRef,
    protected elementRef: ElementRef,
    protected store: Store<any>
  ) {
    super(store, renderer, elementRef);
  }

  drawGraph(forceRedraw = false) {
    const container = this.singleGraphContainer.nativeElement;
    if (this.alreadyDrawn && !forceRedraw && !this.shouldRefresh) {
      return;
    }
    this.alreadyDrawn = this.alreadyDrawn && !forceRedraw;
    this.shouldRefresh = false;
    const [root, data, layout, config, graphEl] = this.drawPlotly();
    if (!document.body.contains(graphEl)) {
      container.appendChild(graphEl);
    }
    // root.height > 0 to avoid rare plotly exception
    if (this.singleGraphContainer.nativeElement.offsetWidth !== this.previousOffsetWidth && (root as HTMLElement).offsetHeight > 0) {
      Plotly.relayout(root, {width: Math.max(getOr(0, 'data[0].cells.values.length', data) * 100, this.singleGraphContainer.nativeElement.offsetWidth - 3)});
      this.previousOffsetWidth = this.singleGraphContainer.nativeElement.offsetWidth - 3;
    }
    Plotly.react(root, data, layout, config);


    this.initColorSubscription();
    if (!this.alreadyDrawn) {
      this.subscribeColorButtons(container);
    }
    this.alreadyDrawn = true;
  }

  drawPlotly(): [Root, Data[], Partial<ExtLayout>, Partial<Config>, Element] {
    this.chart_data = this.chart_data || this.renderer.createElement('div');
    this.chartElm = this.chartElm || this.renderer.createElement('div');
    this.chartElm.classList.add('chart');
    //    this.chartElm.className = 'chart';
    if (!document.body.contains(this.chartElm)) {
      this.chart_data.appendChild(this.chartElm);
    }

    const graph = this.formatChartLines() as ExtFrame;
    this.type = getOr(graph.layout.type, 'data[0].type', graph);
    const iterText = graph.iter ? ` - Iteration ${graph.iter}` : '';
    let layout = {
      ...graph.layout,
      // height    : 400, // TODO: fix legend position to bottom and add height e.g: `height: 400 + plot_json.data.length * 20` - YK
      // width     : (this.customPlots.nativeElement.offsetWidth - 10) / 2,
      modebar: {
        'color': '#8F9DC9',
        'activecolor': '#4D66FF'
      },
      title: {
        text: graph.layout.title + iterText
      },

      uirevision: 'static', // Saves the UI state between redraws https://plot.ly/javascript/uirevision/
      legend: {
        'traceorder': 'normal',
        'xanchor': 'left',
        'yanchor': 'top',
        'x': 1,
        'y': 1,
        'borderwidth': 2,
        'bordercolor': '#FFFFFF',
        'orientation': 'v',
        'valign': 'top',
        'font': {'color': '#000', 'size': 12, 'family': 'sans-serif'}
      },
      showlegend: (this.chartElm.layout?.hasOwnProperty('showlegend')) ? this.chartElm.layout.showlegend : graph.layout?.showlegend !== false,
      margin: graph.layout.margin ? graph.layout.margin : {'l': 70, 'r': 50, 't': 80, 'b': 90, 'pad': 0, 'autoexpand': true} as Partial<Margin>,
    } as Partial<ExtLayout>;

    if (this.type === 'table') {
      this.changeDetector.detectChanges();
      // override header design
      graph.data[0].header = {
        ...graph.data[0].header,
        line: {width: 1, color: '#d4d6e0'},
        align: 'left',
        font: {
          color: ['#5a658e'],
          size: 12
        },
        fill: {color: 'white'}
      };

      // override cells design
      graph.data[0].cells = {
        ...graph.data[0].cells,
        align: 'left',
        height: 30,
        font: {
          color: ['#5a658e'],
          size: 12
        },
        line: {width: 0, color: 'transparent'}
      };
      layout.width = Math.max(getOr(0, 'data[0].cells.values.length', graph) * 100, this.singleGraphContainer.nativeElement.offsetWidth - 3);
      layout.title = {
        ...layout.title as {},
        xanchor: 'left',
        xref: 'paper',
        x: 0
      };
      const numberOfRows = getOr(0, 'data[0].cells.values[0].length', graph);
      if (numberOfRows && graph.data[0].cells) {
        graph.data[0].cells.fill = {...graph.data[0].cells.fill, color: [(Array(numberOfRows).fill(['#f5f7ff', 'white']) as any).flat()]};

      }
      layout.margin = {
        'l': 24,
        't': this.isCompare ? 52 : 32,
        'r': 24,
        'b': 0
      };
      layout.height = Math.min(getOr(15, 'data[0].cells.values[0].length', graph) * 30 + 70, 500);
    }
    const barLayoutConfig = {
      hovermode: 'closest',
    };

    const scatterLayoutConfig: Partial<ExtLayout> = {
      // spikedistance: -1,
      // hoverdistance: -1,
      // hovermode    : 'x',
      xaxis: {
        ...graph.layout.xaxis,
        spikecolor: '#000000FF',
        showspikes: true,
        spikemode: 'across',
        spikesnap: 'cursor',
        spikethickness: 1,
        spikedash: 'solid',
        rangeslider: {visible: false},
        fixedrange: false,
      },
      yaxis: {
        ...graph.layout.yaxis,
        spikecolor: '#000000FF',
        showspikes: false,
        spikemode: 'across',
        spikesnap: 'cursor',
        spikethickness: 1,
        spikedash: 'dash',
        rangeslider: {visible: false},
        fixedrange: false,
        type: this.yaxisType,
      },
    };

    if (['multiScalar', 'scalar'].includes(graph.layout.type)) {
      if (['scatter', 'scatter3d'].includes(this.type)) {
        layout = {...layout, ...scatterLayoutConfig} as Partial<ExtLayout>;
      }
    }
    if (['bar'].includes(this.type)) {
      layout = {...layout, ...barLayoutConfig} as Partial<ExtLayout>;
    }
    const modBarButtonsToAdd: Plotly.ModeBarButton[] = [];
    if (['multiScalar', 'scalar'].includes(graph.layout.type)) {
      modBarButtonsToAdd.push({
        name: 'Log view',
        title: this.getLogButtonTitle(this.yaxisType === 'log'),
        icon: this.getLogIcon(this.yaxisType === 'log'),
        click: (gd: Plotly.PlotlyHTMLElement, ev: MouseEvent) => {
          this.yaxisType = this.yaxisType === 'log' ? 'linear' : 'log';
          const icon = this.getLogIcon(this.yaxisType === 'log');
          let path: SVGPathElement;
          let svg: HTMLElement;
          if ((ev.target as SVGElement).tagName === 'svg') {
            svg = ev.target as HTMLElement;
            path = (ev.target as SVGElement).firstChild as SVGPathElement;
          } else {
            path = ev.target as SVGPathElement;
            svg = path.parentElement as HTMLElement;
          }
          svg.parentElement.attributes['data-title'].value = this.getLogButtonTitle(this.yaxisType === 'log');
          path.attributes[0].value = icon.path;
          this.smoothnessTimeout = window.setTimeout(() => {
              this._chart = cloneDeep(this.originalChart);
              this.drawGraph(true);
            }
            , 400);
        }
      });
    }
    if (!['table'].includes(get('data[0].type', graph)) && graph.layout?.showlegend !== false) {
      modBarButtonsToAdd.push({
        name: 'Hide legend',
        title: this.getHideButtonTitle(),
        icon: this.getToggleLegendIcon(),
        click: (element, ev: any) => {
          const pathElement = ev.target.tagName === 'path' ? ev.target : (ev.target as HTMLElement).querySelector('path');
          const svg = pathElement.parentElement;
          pathElement.style.fill = this.chartElm.layout?.showlegend ? 'rgb(77, 102, 255)' : 'rgb(143, 157, 201)';
          svg.parentElement.attributes['data-title'].value = this.getHideButtonTitle();
          this.chartElm.layout.showlegend = !this.chartElm.layout.showlegend;
          if (this.chartElm.layout.showlegend) {
            setTimeout(() => this.subscribeColorButtons(this.singleGraphContainer.nativeElement), 200);
          }
          Plotly.relayout(this.chartElm, {showlegend: this.chartElm.layout.showlegend});
        }
      });
    }
    modBarButtonsToAdd.push({
      name: 'Download JSON',
      title: 'Download JSON',
      icon: this.getIcon(),
      click: () => {
        this.downloadGraphAsJson(cloneDeep(this.originalChart));
      }
    });
    const config = {
      'modeBarButtonsToRemove': ['sendDataToCloud'] as ModeBarDefaultButtons[],
      'displaylogo': false,
      'modeBarButtonsToAdd': modBarButtonsToAdd

    };

    return [this.chartElm, graph.data, layout, config, this.chart_data];
  }

  private formatChartLines() {
    if (this.alreadyDrawn) {
      return this.chart;
    }

    const graph = this.chart;
    graph.data = this.addIdToDuplicateExperiments(this.chart.data, this.chart.task);
    const smoothLines = [];
    const timeUnit = chooseTimeUnit(graph.data) as { time: number; str: string };

    for (let i = 0; i < graph.data.length; i++) {
      if (!graph.data[i].name) {
        continue;
      }

      if (!this.alreadyDrawn && !graph.data[i].name.includes('<span style="display: none;"')) {
        graph.data[i].name = escape(graph.data[i].name);

        if (this.xAxisType === ScalarKeyEnum.Timestamp) {
          const zeroTime = graph.data[i].x[0] as number;
          graph.data[i].x = (graph.data[i].x as Datum[]).map((timestamp: number) => (timestamp - zeroTime) / timeUnit.time);
          // graph.data[i].hovertext = graph.data[i].x.map(timestamp => timeInWords((timestamp - zeroTime)));
        }

        const colorKey = this.generateColorKey(graph, i);
        const wrappedText = wordWrap(graph.data[i].name, this.legendStringLength || 19);
        const finalText = wrappedText + `<span style="display: none;" class="color-key" data-color-key="${colorKey}"></span>`;
        graph.data[i].name = finalText;
      }
      const color = this.colorHash.initColor(this.extractColorKey(graph.data[i].name));
      this._reColorTrace(graph.data[i], color);

      if (this.isSmooth) {
        graph.data[i].legendgroup = graph.data[i].name;
        graph.data[i].showlegend = false;
        graph.data[i].hoverinfo = 'skip';
        smoothLines.push(this.resmoothDataset(graph.data[i], color));
      }
    }
    this.setAxisText(graph, timeUnit);
    graph.data = graph.data.concat(smoothLines);
    return graph;
  }

  public generateColorKey(graph: any, i) {
    const variant = graph.data[i].name;
    if (!this.isCompare) {
      return `${variant}-${graph.metric}`;
    } else {
      const task = graph.data[i].task;
      return `${variant}-${task}`;
    }
  }

  private resmoothDataset(line, color) {
    const newLine = cloneDeep(line);

    const data = newLine.y;
    let last = data.length > 0 ? data[0] : NaN;
    newLine.legendgroup = line.name;
    newLine.showlegend = true;
    newLine.isSmoothed = true;
    newLine.hovertext = newLine.hovertext ? newLine.hovertext + '(Smoothed)' : '(Smoothed)';
    newLine.hoverinfo = 'all';

    this._reColorTrace(newLine, color);
    let smoothed;
    data.forEach((d, index) => {
      if (!isFinite(last)) {
        smoothed = d;
      } else {
        // 1st-order IIR low-pass filter to attenuate the higher-
        // frequency components of the time-series.
        smoothed = last * this.smoothWeight + (1 - this.smoothWeight) * d;
        newLine.y[index] = smoothed;
      }
      last = smoothed;
    });
    return newLine;
  }

  private initColorSubscription(forceRedraw = false) {
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
      .subscribe(colorObj => {
        const graph = this.chart;
        let changed: boolean = false;
        for (let i = 0; i < graph.data.length; i++) {
          const name = graph.data[i].name;
          if (!name) {
            continue;
          }
          const colorKey = this.extractColorKey(name);
          const oldColor = this._getTraceColor(graph.data[i]);
          const newColorArr = colorObj[colorKey];
          const newColor = newColorArr ? `rgb(${newColorArr[0]},${newColorArr[1]},${newColorArr[2]})` : false;
          if (oldColor !== newColor && newColor) {
            changed = true;
            this._reColorTrace(graph.data[i], newColorArr);
          }
        }
        if (changed) {
          Plotly.redraw(this.chartElm);
        }

      });
  }

  private subscribeColorButtons(container) {
    const traces = container.querySelectorAll('.traces');
    for (let i = 0; i < traces.length; i++) {
      const textEl = traces[i].querySelector('.legendtext');
      const text = textEl ? this.extractColorKey(textEl.getAttribute('data-unformatted')) : '';
      const layers = traces[i].querySelector('.layers');
      const parentEl = layers.parentElement;
      parentEl.removeChild(layers); // Needed because z-index in svg is by element order
      parentEl.appendChild(layers);
      attachColorChooser(text, layers, this.colorHash, this.store);
    }
  }


  private setAxisText(chart: any, timeUnit?: { time: number; str: string }) {
    const title = this.getAxisText(timeUnit);
    if (!chart.layout.xaxis) {
      chart.layout.xaxis = {};
    }
    if (title) {
      chart.layout.xaxis.title = title;
    }
    return chart;
  }

  downloadGraphAsJson(chart) {
    let timeUnit;
    if (this.xAxisType === ScalarKeyEnum.Timestamp) {
      for (let i = 0; i < chart.data.length; i++) {
        if (!chart.data[i].name) {
          continue;
        }

        timeUnit = typeof timeUnit === 'undefined' ? chooseTimeUnit(chart.data) : timeUnit;
        const zeroTime = chart.data[i].x[0];
        chart.data[i].x = chart.data[i].x.map(timestamp => (timestamp - zeroTime) / timeUnit.time);
        // graph.data[i].hovertext = graph.data[i].x.map(timestamp => timeInWords((timestamp - zeroTime)));
      }
    }
    const exportName = `${chart.layout.title} -  ${this.getAxisText(timeUnit)}`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chart.data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', exportName + '.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  getIcon() {
    return {
      'width': 1792,
      'path': 'M1344 1344q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h465l135 136q58 56 136 56t136-56l136-136h464q40 0 68 28t28 68zm-325-569q17 41-14 70l-448 448q-18 19-45 19t-45-19l-448-448q-31-29-14-70 17-39 59-39h256v-448q0-26 19-45t45-19h256q26 0 45 19t19 45v448h256q42 0 59 89z',
      'ascent': 1792,
      'descent': 0,
      'transform': 'translate(0, -100)'
    };
  }

  getToggleLegendIcon() {
    return {
      'width': 1000,
      'fill': 'rgb(77, 102, 255)',
      'path': 'M200,250H50a50,50,0,0,1,0-100H200a50,50,0,0,1,0,100Zm800-50a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,200ZM250,400a50,50,0,0,0-50-50H50a50,50,0,0,0,0,100H200A50,50,0,0,0,250,400Zm750,0a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,400ZM250,600a50,50,0,0,0-50-50H50a50,50,0,0,0,0,100H200A50,50,0,0,0,250,600Zm750,0a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,600ZM250,800a50,50,0,0,0-50-50H50a50,50,0,0,0,0,100H200A50,50,0,0,0,250,800Zm750,0a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,800Z',
      'ascent': 1000,
      'descent': 0,
      'transform': 'translate(0, -100)'
    };
  }

  getLogIcon(onOrOff: boolean) {
    if (!onOrOff) {
      return {
        'width': 1000,
        'path': 'M797,772a29.4,29.4,0,0,1-3.1-.16c-130-13.31-240.09-51.57-327.17-113.74-70.33-50.2-125.62-115.78-164.34-194.91C236.94,329.34,241.79,203.92,242,198.64A30,30,0,0,1,302,201.31h0c-.05,1.16-4.17,117.36,55.41,237.65,34.47,69.59,83.42,127.19,145.5,171.2,78.3,55.51,178.29,89.82,297.18,102A30,30,0,0,1,797,772Zm111,80.5H147.5V92H38v28H92.5v29H37v28H92.5v41H38v28H92.5v64H38v28H92.5V446H38v28H92.5V639H38v28H92.5V852.5H0v55H92.5V1000h55V907.5H908Z',
        'ascent': 1000,
        'descent': 0,
        'transform': 'translate(0, -100)'
      };
    }
    return {
      'width': 1000,
      'path': 'M908,907.5H147.5V1000h-55V907.5H0v-55H92.5V120H37V92H147.5V852.5H908ZM883.79,239.14a30,30,0,0,0-41.65,8.07L672,499.21,471.48,411.78a59.49,59.49,0,0,0-117.89-.59l-154.22,71.6a30,30,0,1,0,25.26,54.42l151.74-70.45a59.48,59.48,0,0,0,71.85.33L667,562.5A29.91,29.91,0,0,0,679,565c.85,0,1.68,0,2.52-.12s1.65.11,2.47.11a30,30,0,0,0,24.89-13.21l183-271A30,30,0,0,0,883.79,239.14ZM894,627a30,30,0,0,0-41-11l-129.1,74.28a59.5,59.5,0,0,0-87.83,25.11L219.32,711H219a30,30,0,0,0-.31,60l424.43,4.47a59.48,59.48,0,0,0,106.65-30.82L883,668A30,30,0,0,0,894,627Z',
      'ascent': 1000,
      'descent': 0,
      'transform': 'translate(0, -100)'
    };
  }

  getLogButtonTitle(onOrOff: boolean) {
    return `Switch to ${onOrOff ? 'Linear' : 'Logarithmic'} scale`;
  }

  private getAxisText(timeUnit: { time: number; str: string }) {
    switch (this.xAxisType) {
      case ScalarKeyEnum.Iter:
        return 'Iterations';
      case ScalarKeyEnum.IsoTime:
        return 'Wall Time';
      case ScalarKeyEnum.Timestamp:
        return (timeUnit && timeUnit.str) ? `${timeUnit.str} From Start` : 'Relative Time';
      default:
        return null;
    }
  }

  private getHideButtonTitle() {
    return this.chartElm.layout?.showlegend ? 'Show legend' : 'Hide legend';
  }
}
