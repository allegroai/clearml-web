import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input, NgZone,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {ColorHashService} from '../../services/color-hash/color-hash.service';
import {chooseTimeUnit, wordWrap} from '../../../tasks/tasks.utils';
import {attachColorChooser} from '../../ui-components/directives/choose-color/choose-color.directive';
import {debounceTime, filter} from 'rxjs/operators';
import {cloneDeep, escape, get, getOr} from 'lodash/fp';
import {
  AxisType,
  Config,
  Data,
  Datum,
  Margin,
  ModeBarButton,
  ModeBarDefaultButtons,
  PlotData,
  PlotlyHTMLElement, PlotMarker,
  Root
} from 'plotly.js';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';
import {ExtData, ExtFrame, ExtLayout, ExtLegend, PlotlyGraphBase} from './plotly-graph-base';
import {Store} from '@ngrx/store';
import {ResizeEvent} from 'angular-resizable-element';
import {select} from 'd3-selection';
import {MatDialog} from '@angular/material/dialog';
import {GraphDisplayerComponent} from '../graph-displayer/graph-displayer.component';
import {PALLET} from '../../../constants';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const Plotly;
const DARK_THEME_GRAPH_LINES_COLOR = '#39405f';
const DARK_THEME_GRAPH_TICK_COLOR = '#c1cdf3';

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
  private chartData: HTMLDivElement;
  public shouldRefresh: boolean = false;
  private yaxisType: AxisType = 'linear';
  public type: PlotData['type'] | 'table';
  private previousOffsetWidth: number;

  @Input() identifier: string;
  @Input() hideTitle: boolean = false;
  @Input() disableResize: boolean = false;
  @Input() isDarkTheme: boolean;
  @Input() showLoaderOnDraw = true;
  @Input() isMaximized: boolean = false;
  @Input() legendConfiguration: Partial<ExtLegend & { noTextWrap: boolean }> = {};
  @Input() height: number = 450;
  public loading: boolean;

  @Input() set chart(chart: ExtFrame) {
    this.originalChart = cloneDeep(chart);
    this._chart = chart;
  }

  get chart(): ExtFrame {
    return this._chart;
  }

  @Input() moveLegendToTitle = false;
  @Input() legendStringLength: number;
  @Input() graphsNumber: number;
  @Input() xAxisType: ScalarKeyEnum;

  @Input() set smoothWeight(ratio: number) {
    this.isSmooth = ratio > 0;
    if (this.alreadyDrawn) {
      clearTimeout(this.smoothnessTimeout);
      this.smoothnessTimeout = window.setTimeout(() => {
        this._chart = cloneDeep(this.originalChart);
        this.drawGraph(true);
      }, 400);
    }
    this._smoothWeight = ratio;
  }

  get smoothWeight() {
    return this._smoothWeight;
  }

  @Output() sizeChanged = new EventEmitter<ResizeEvent>();
  @Output() resizing = new EventEmitter<ResizeEvent>();
  @Output() resizeStarted = new EventEmitter();

  @ViewChild('drawHere', {static: true}) singleGraphContainer: ElementRef;
  private chartElm;
  private _smoothWeight: number;


  constructor(
    protected renderer: Renderer2,
    private colorHash: ColorHashService,
    private changeDetector: ChangeDetectorRef,
    public elementRef: ElementRef,
    protected store: Store,
    private dialog: MatDialog,
    private readonly zone: NgZone
  ) {
    super(store);
  }

  drawGraph(forceRedraw = false) {
    if (this.showLoaderOnDraw) {
      this.loading = true;
      this.changeDetector.detectChanges();
    }
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
    let skipReact = false;
    // root.height > 0 to avoid rare plotly exception
    if (this.singleGraphContainer.nativeElement.offsetWidth !== this.previousOffsetWidth && (root as HTMLElement).offsetHeight > 0) {
      skipReact = true;
      this.zone.runOutsideAngular(() => Plotly.relayout(root, {
        width: Math.max(getOr(0, 'data[0].cells.values.length', data) * 100, this.singleGraphContainer.nativeElement.offsetWidth - 3)
      }).then(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
        this.updateLegend();
      }));
    }
    this.previousOffsetWidth = this.singleGraphContainer.nativeElement.offsetWidth;

    if (!skipReact) {
      this.zone.runOutsideAngular(() => Plotly.react(root, data, layout, config).then(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      }));

    }

    this.initColorSubscription();
    if (!this.alreadyDrawn) {
      setTimeout(() => {
        this.subscribeColorButtons(container);
        this.updateLegend();
      });
    }
    this.alreadyDrawn = true;
  }

  drawPlotly(): [Root, Data[], Partial<ExtLayout>, Partial<Config>, Element] {
    this.chartData = this.chartData || this.renderer.createElement('div');
    this.chartElm = this.chartElm || this.renderer.createElement('div');
    this.chartElm.classList.add('chart');
    if (!document.body.contains(this.chartElm)) {
      this.chartData.appendChild(this.chartElm);
    }

    const graph = this.formatChartLines() as ExtFrame;
    this.type = getOr(graph.layout.type, 'data[0].type', graph);
    let layout = {
      ...this.addParametersIfDarkTheme({
        font: {
          color: '#FFFFFF',
          family: '"Heebo", sans-serif, sans-serif',
        }
      }),
      ...graph.layout,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...this.addParametersIfDarkTheme({plot_bgcolor: 'transparent'}),
      height: this.height,
      modebar: {
        color: '#8F9DC9',
        activecolor: '#4D66FF',
        ...this.addParametersIfDarkTheme({
          activecolor: PALLET.blue500,
          bgcolor: 'transparent',
        }),
      },
      title: {
        ...(!this.hideTitle && {text: this.addIterationString(graph.layout.title as string, graph.iter)}),
        ...this.addParametersIfDarkTheme({
          font: {
            color: this.isDarkTheme ? PALLET.blue100 : 'dce0ee'
          },
        }),
      },
      ...this.addParametersIfDarkTheme({
        xaxis: {
          color: DARK_THEME_GRAPH_LINES_COLOR,
          gridcolor: DARK_THEME_GRAPH_LINES_COLOR,
          zerolinecolor: DARK_THEME_GRAPH_LINES_COLOR,
          tickfont: {
            color: DARK_THEME_GRAPH_TICK_COLOR
          },
          title: {
            text: graph.layout.xaxis.title,
            font: {
              color: '#dce0ee'
            }
          },
        },
        yaxis: {
          color: DARK_THEME_GRAPH_LINES_COLOR,
          gridcolor: DARK_THEME_GRAPH_LINES_COLOR,
          zerolinecolor: DARK_THEME_GRAPH_LINES_COLOR,
          tickfont: {
            color: DARK_THEME_GRAPH_TICK_COLOR
          }
        }
      }),
      uirevision: 'static', // Saves the UI state between redraws https://plot.ly/javascript/uirevision/
      legend: {
        traceorder: 'normal',
        xanchor: 'left',
        yanchor: 'top',
        x: this.moveLegendToTitle ? 0 : 1,
        y: 1,
        borderwidth: 2,
        bordercolor: '#FFFFFF',
        orientation: 'v',
        valign: 'top',
        font: {color: '#000', size: 12, family: 'sans-serif'},
        ...this.addParametersIfDarkTheme({
          bgcolor: 'transparent',
          bordercolor: 'transparent',
          font: {color: '#dce0ee', size: 12, family: 'sans-serif'},
        }),
        ...this.legendConfiguration
      },
      showlegend: this.chartElm.layout && Object.prototype.hasOwnProperty.call(this.chartElm.layout, 'showlegend') ? this.chartElm.layout.showlegend : graph.layout?.showlegend !== false,
      margin: graph.layout.margin ? graph.layout.margin : {
        l: 70,
        r: 50,
        t: 80,
        b: 90,
        pad: 0,
        autoexpand: true
      } as Partial<Margin>,
    } as Partial<ExtLayout>;

    if (this.type === 'table') {
      this.changeDetector.detectChanges();
      // override header design
      graph.data[0].header = {
        ...graph.data[0].header,
        line: {width: 1, color: this.isDarkTheme ? '#39405F' : '#d4d6e0'},
        align: 'left',
        font: {
          color: [this.isDarkTheme ? PALLET.blue200 : PALLET.blue400],
          size: 12
        },
        fill: {...graph.data[0].header?.fill, color: this.isDarkTheme ? PALLET.blue800 : PALLET.blue50}
      };

      // override cells design
      graph.data[0].cells = {
        ...graph.data[0].cells,
        align: 'left',
        height: 30,
        font: {
          color: [this.isDarkTheme ? PALLET.blue200 : PALLET.blue400],
          size: 12
        },
        fill: {...graph.data[0].cells, color: this.isDarkTheme ? PALLET.blue950 : '#ffffff'},
        line: {width: 1, color: this.isDarkTheme ? DARK_THEME_GRAPH_LINES_COLOR : PALLET.blue100}
      };
      layout.width = Math.max(getOr(0, 'data[0].cells.values.length', graph) * 100, this.singleGraphContainer.nativeElement.offsetWidth - 3);
      layout.title = {
        ...layout.title as Record<string, any>,
        text: this.addIterationString(layout.name, graph.iter) || (layout.title as Record<string, any>).text,
        xanchor: 'left',
        xref: 'paper',
        x: 0
      };
      layout.margin = {
        l: 24,
        t: 52,
        r: 24,
        b: 0
      };
      layout.height = Math.min(getOr(15, 'data[0].cells.values[0].length', graph) * 30 + 150, this.height);
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
        ...this.addParametersIfDarkTheme({
          color: DARK_THEME_GRAPH_LINES_COLOR,
          title: {
            text: graph.layout.xaxis.title,
            font: {
              color: '#dce0ee'
            }
          },
          gridcolor: DARK_THEME_GRAPH_LINES_COLOR,
          zerolinecolor: DARK_THEME_GRAPH_LINES_COLOR,
          tickfont: {
            color: DARK_THEME_GRAPH_TICK_COLOR
          }

        })
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
        ...this.addParametersIfDarkTheme({
          color: DARK_THEME_GRAPH_LINES_COLOR,
          gridcolor: DARK_THEME_GRAPH_LINES_COLOR,
          zerolinecolor: DARK_THEME_GRAPH_LINES_COLOR,
          tickfont: {
            color: DARK_THEME_GRAPH_TICK_COLOR
          }
        })
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

    const modBarButtonsToAdd: ModeBarButton[] = [];

    if (['multiScalar', 'scalar'].includes(graph.layout.type)) {
      modBarButtonsToAdd.push({
        name: 'Log view',
        title: this.getLogButtonTitle(this.yaxisType === 'log'),
        icon: this.getLogIcon(this.yaxisType === 'log'),
        click: (gd: PlotlyHTMLElement, ev: MouseEvent) => {
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
          }, 400);
        }
      });
    }
    if (!['table', 'parcoords'].includes(get('data[0].type', graph)) && graph.layout?.showlegend !== false && !this.moveLegendToTitle) {
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
            setTimeout(() => {
              this.subscribeColorButtons(this.singleGraphContainer.nativeElement);
              this.updateLegend();
            }, 20);
          }
          this.zone.runOutsideAngular(() => Plotly.relayout(this.chartElm, {showlegend: this.chartElm.layout.showlegend}));
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
    if (!this.isMaximized) {
      const maximizeButton: ModeBarButton = {
        name: 'Maximize',
        title: 'Maximize Graph',
        icon: this.getMaximizeIcon(),
        click: () => {
          this.maximizeGraph();
        }
      };
      modBarButtonsToAdd.push(maximizeButton);
    }
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'] as ModeBarDefaultButtons[],
      displaylogo: false,
      modeBarButtonsToAdd: modBarButtonsToAdd
    };

    return [this.chartElm, graph.data, layout, config, this.chartData];
  }

  private updateLegend() {
    const graph = select(this.singleGraphContainer.nativeElement);
    graph.selectAll('.legendpoints path')
      .attr('d', 'M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z');
    graph.selectAll('.legendtoggle')
      .on('click', () => window.setTimeout(() => graph.selectAll('.legendpoints path')
        .attr('d', 'M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z'), 300)
      );
  }

  private formatChartLines() {
    if (this.alreadyDrawn) {
      return this.chart;
    }

    const graph = this.chart;
    if (this.isCompare) {
      graph.data = this.addIdToDuplicateExperiments(this.chart.data, this.chart.task);
    }
    const smoothLines = [];
    const timeUnit = chooseTimeUnit(graph.data) as { time: number; str: string };

    for (let i = 0; i < graph.data.length; i++) {
      if (!graph.data[i].name) {
        graph.data[i].name = `graph.metric ${i}`;
      }

      if (!this.alreadyDrawn && !graph.data[i].name.includes('<span style="display: none;"')) {
        graph.data[i].name = escape(graph.data[i].name);

        if (this.xAxisType === ScalarKeyEnum.Timestamp) {
          const zeroTime = graph.data[i].x[0] as number;
          graph.data[i].x = (graph.data[i].x as Datum[]).map((timestamp: number) => (timestamp - zeroTime) / timeUnit.time);
          // graph.data[i].hovertext = graph.data[i].x.map(timestamp => timeInWords((timestamp - zeroTime)));
        }
        if (graph.data[i].type === 'bar' && !graph.data[i].marker) {
          graph.data[i].marker = {} as Partial<PlotMarker>;
        }
        const colorKey = this.generateColorKey(graph, i);
        const wrappedText = !this.legendConfiguration.noTextWrap ? wordWrap(graph.data[i].name, this.legendStringLength || 19) : graph.data[i].name;
        graph.data[i].name = wrappedText + `<span style="display: none;" class="color-key" data-color-key="${colorKey}"></span>`;
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

  public generateColorKey(graph: ExtFrame, i: number) {
    const variant = graph.data[i].colorHash || graph.data[i].name;
    if (!this.isCompare) {
      return `${variant}?`;  // "?" to adjust desired colors (legend title is removing this ?)
    } else {
      const task = graph.data[i].task;
      return `${variant}-${task}`;
    }
  }

  private resmoothDataset(line: ExtData, color) {
    const newLine = cloneDeep(line);

    const data = newLine.y;
    let last = data.length > 0 ? data[0] as number : NaN;
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
        graph.data.forEach(trace => {
          const name = trace.name;
          if (!name) {
            return;
          }
          const colorKey = this.extractColorKey(name);
          const oldColor = this._getTraceColor(trace);
          const newColorArr = colorObj[colorKey];
          const newColor = newColorArr ? `rgb(${newColorArr[0]},${newColorArr[1]},${newColorArr[2]})` : false;
          if (oldColor !== newColor && newColor) {
            changed = true;
            this._reColorTrace(trace, newColorArr);
          }
        });
        if (changed) {
          this.zone.runOutsideAngular(() => Plotly.redraw(this.chartElm));
          this.updateLegend();
        }

      });
  }

  private subscribeColorButtons(container) {
    if (this.scaleExists) {
      const legend = container.querySelector('.groups') as SVGGElement;
      legend.style.transform = 'translate(-10px, 0)';
    }
    if (this.moveLegendToTitle) {
      const graphTitle = container.querySelector('.gtitle') as SVGTextElement;
      if (graphTitle) {
        const endOfTitlePosition = (this.singleGraphContainer.nativeElement.offsetWidth / 2) + (graphTitle.getClientRects()[0].width / 2);
        const legend = container.querySelector('.legend') as SVGGElement;
        legend.style.transform = `translate(${endOfTitlePosition}px, 30px)`;
        legend.classList.add('hide-text');
      }
    }
    const traces = container.querySelectorAll('.traces');
    for (const trace of traces) {
      const textEl = trace.querySelector('.legendtext') as SVGTextElement;
      const text = textEl ? this.extractColorKey(textEl.getAttribute('data-unformatted')) : '';

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = text.replace('?', '');
      textEl.parentElement.appendChild(title);

      const layers = trace.querySelector('.layers');
      const parentEl = layers.parentElement;
      parentEl.removeChild(layers); // Needed because z-index in svg is by element order
      parentEl.appendChild(layers);
      attachColorChooser(text, layers, this.colorHash, this.store);
    }
  }


  private setAxisText(chart: ExtFrame, timeUnit?: { time: number; str: string }) {
    const title = this.getAxisText(timeUnit);
    if (!chart.layout.xaxis) {
      chart.layout.xaxis = {};
    }
    if (title) {
      chart.layout.xaxis.title = title;
    }
    return chart;
  }

  downloadGraphAsJson(chart: ExtFrame) {
    let timeUnit;
    if (this.xAxisType === ScalarKeyEnum.Timestamp) {
      chart.data.forEach(graphData => {
        if (!graphData.name) {
          return;
        }

        timeUnit = typeof timeUnit === 'undefined' ? chooseTimeUnit(chart.data) : timeUnit;
        const zeroTime = graphData.x[0] as number;
        graphData.x = (graphData.x as number[]).map(timestamp => (timestamp - zeroTime) / timeUnit.time);
        // graph.data[i].hovertext = graph.data[i].x.map(timestamp => timeInWords((timestamp - zeroTime)));
      });
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
      width: 1792,
      path: 'M1344 1344q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h465l135 136q58 56 136 56t136-56l136-136h464q40 0 68 28t28 68zm-325-569q17 41-14 70l-448 448q-18 19-45 19t-45-19l-448-448q-31-29-14-70 17-39 59-39h256v-448q0-26 19-45t45-19h256q26 0 45 19t19 45v448h256q42 0 59 89z',
      ascent: 1792,
      descent: 0,
      transform: 'translate(0, -100)'
    };
  }

  getToggleLegendIcon() {
    return {
      width: 1000,
      fill: 'rgb(77, 102, 255)',
      path: 'M200,250H50a50,50,0,0,1,0-100H200a50,50,0,0,1,0,100Zm800-50a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,200ZM250,400a50,50,0,0,0-50-50H50a50,50,0,0,0,0,100H200A50,50,0,0,0,250,400Zm750,0a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,400ZM250,600a50,50,0,0,0-50-50H50a50,50,0,0,0,0,100H200A50,50,0,0,0,250,600Zm750,0a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,600ZM250,800a50,50,0,0,0-50-50H50a50,50,0,0,0,0,100H200A50,50,0,0,0,250,800Zm750,0a50,50,0,0,0-50-50H400a50,50,0,0,0,0,100H950A50,50,0,0,0,1000,800Z',
      ascent: 1000,
      descent: 0,
      transform: 'translate(0, -100)'
    };
  }

  getMaximizeIcon() {
    return {
      width: 1000,
      height: 1000,
      fill: 'rgb(77, 102, 255)',
      path: 'M920,80V436.38L771.51,287.89,559.4,500,500,440.6,712.11,228.49,563.62,80ZM500,559.4,440.6,500,228.49,712.11,80,563.62V920H436.38L287.89,771.51Z',
      ascent: 1000,
      descent: 0,
      transform: 'translate(0, -100)'
    };
  }

  getLogIcon(onOrOff: boolean) {
    if (!onOrOff) {
      return {
        width: 1000,
        path: 'M797,772a29.4,29.4,0,0,1-3.1-.16c-130-13.31-240.09-51.57-327.17-113.74-70.33-50.2-125.62-115.78-164.34-194.91C236.94,329.34,241.79,203.92,242,198.64A30,30,0,0,1,302,201.31h0c-.05,1.16-4.17,117.36,55.41,237.65,34.47,69.59,83.42,127.19,145.5,171.2,78.3,55.51,178.29,89.82,297.18,102A30,30,0,0,1,797,772Zm111,80.5H147.5V92H38v28H92.5v29H37v28H92.5v41H38v28H92.5v64H38v28H92.5V446H38v28H92.5V639H38v28H92.5V852.5H0v55H92.5V1000h55V907.5H908Z',
        ascent: 1000,
        descent: 0,
        transform: 'translate(0, -100)'
      };
    }
    return {
      width: 1000,
      path: 'M908,907.5H147.5V1000h-55V907.5H0v-55H92.5V120H37V92H147.5V852.5H908ZM883.79,239.14a30,30,0,0,0-41.65,8.07L672,499.21,471.48,411.78a59.49,59.49,0,0,0-117.89-.59l-154.22,71.6a30,30,0,1,0,25.26,54.42l151.74-70.45a59.48,59.48,0,0,0,71.85.33L667,562.5A29.91,29.91,0,0,0,679,565c.85,0,1.68,0,2.52-.12s1.65.11,2.47.11a30,30,0,0,0,24.89-13.21l183-271A30,30,0,0,0,883.79,239.14ZM894,627a30,30,0,0,0-41-11l-129.1,74.28a59.5,59.5,0,0,0-87.83,25.11L219.32,711H219a30,30,0,0,0-.31,60l424.43,4.47a59.48,59.48,0,0,0,106.65-30.82L883,668A30,30,0,0,0,894,627Z',
      ascent: 1000,
      descent: 0,
      transform: 'translate(0, -100)'
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

  validateResize($event: ResizeEvent): boolean {
    return $event.rectangle.width > 300 && $event.rectangle.height > 250;
  }

  private maximizeGraph() {

    this.dialog.open(GraphDisplayerComponent, {
      data: {
        // signed url are updated after originChart was cloned - need to update images urls!
        chart: cloneDeep({
          ...this.originalChart,
          layout: {...this.originalChart.layout, images: this.chart.layout?.images}
        }),
        id: this.identifier,
        xAxisType: this.xAxisType,
        smoothWeight: this.smoothWeight,
        darkTheme: this.isDarkTheme,
        isCompare: this.isCompare,
      },
      panelClass: ['image-displayer-dialog', this.isDarkTheme ? 'dark-theme' : 'light-theme'],
      height: '100%',
      maxHeight: 'auto',
      width: '100%',
      maxWidth: 'auto'
    });
  }

  private addParametersIfDarkTheme(object: Record<string, unknown>) {
    return this.isDarkTheme ? object : {};
  }

  private addIterationString(name: string, iter: number) {
    return name + ((iter || (this.graphsNumber > 1 && iter === 0)) ? ` - Iteration ${iter}` : '');
  }
}
