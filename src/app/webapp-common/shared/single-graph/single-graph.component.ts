import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  Input, NgZone, Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {wordWrap} from '@common/tasks/tasks.utils';
import {attachColorChooser} from '@common/shared/ui-components/directives/choose-color/choose-color.directive';
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
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {ExtData, ExtFrame, ExtLayout, ExtLegend, PlotlyGraphBaseComponent} from './plotly-graph-base';
import {Store} from '@ngrx/store';
import {select} from 'd3-selection';
import {MatDialog} from '@angular/material/dialog';
import {GraphViewerComponent} from './graph-viewer/graph-viewer.component';
import {PALLET} from '@common/constants';
import {download} from '@common/shared/utils/download';
import {Subject} from 'rxjs';
import {hexToRgb} from '@common/shared/services/color-hash/color-hash.utils';
import {chooseTimeUnit} from '@common/shared/utils/choose-time-unit';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const Plotly;
const DARK_THEME_GRAPH_LINES_COLOR = '#39405f';
const DARK_THEME_GRAPH_TICK_COLOR = '#c1cdf3';
const ORIGIN_COLOR = 'origin-color';
const RATIO_OFFSET_FIX = 37;

export type ChartHoverModeEnum = 'x' | 'y' | 'closest' | false | 'x unified' | 'y unified';

@Component({
  selector: 'sm-single-graph',
  templateUrl: './single-graph.component.html',
  styleUrls: ['./single-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleGraphComponent extends PlotlyGraphBaseComponent {
  public alreadyDrawn: boolean = false;
  public shouldRefresh: boolean = false;
  public loading: boolean;
  public type: PlotData['type'] | 'table';
  public ratio: number;
  public title: string;
  private yaxisType: AxisType = 'linear';
  private originalChart: ExtFrame;
  private _chart: ExtFrame;
  private smoothnessTimeout: number;
  private chartData: HTMLDivElement;
  private previousOffsetWidth: number;
  private modeBar: HTMLElement;
  private previousHeight: number;
  private ratioEnable: boolean;
  private smooth$ = new Subject();
  private _height: number;
  private _hoverMode: ChartHoverModeEnum;

  private drawGraph$ = new Subject();
  @Input() identifier: string;
  @Input() hideTitle: boolean = false;
  @Input() isDarkTheme: boolean;
  @Input() showLoaderOnDraw = true;
  @Input() hideMaximize: 'show' | 'hide' | 'disabled' = 'show';
  @Input() legendConfiguration: Partial<ExtLegend & { noTextWrap: boolean }> = {};

  @Input() set height(height: number) {
    this._height = height;
    if (this.chart) {
      this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
    }
  }

  get height() {
    return this._height;
  }

  @Input() set width(width: number) {
    if (this.chart) {
      this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
    }
  }

  @Input() set chart(chart: ExtFrame) {
    if (chart) {
      this.ratioEnable = !!chart.layout.width && !!chart.layout.height;
      this.ratio = this.ratioEnable ? chart.layout.width / chart.layout.height : null;
      this.height = chart.layout.height || this.height || 450;
      this.originalChart = chart;
      this._chart = cloneDeep(chart);
      this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
    }
  }

  get chart(): ExtFrame {
    return this._chart;
  }

  @Input() moveLegendToTitle = false;
  @Input() legendStringLength = 19;
  @Input() graphsNumber: number;
  @Input() xAxisType: ScalarKeyEnum;

  @Input() set hoverMode(hoverMode) {
    this._hoverMode = hoverMode;
    if (this.chart) {
      this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
    }
  }

  get hoverMode() {
    return this._hoverMode;
  }

  @Input() set smoothWeight(ratio: number) {
    this._smoothWeight = ratio;
    this.isSmooth = ratio > 0;
    if (this.alreadyDrawn) {
      this.smooth$.next(ratio);
    }
  }

  get smoothWeight() {
    return this._smoothWeight;
  }

  @Input() exportForReport = false;
  @Input() noMargins = false;
  @Output() hoverModeChanged = new EventEmitter<ChartHoverModeEnum>();
  @Output() createEmbedCode = new EventEmitter();
  @Output() maximizeClicked = new EventEmitter();
  @ViewChild('drawHere', {static: true}) plotlyContainer: ElementRef;
  private chartElm;
  private _smoothWeight: number;


  constructor(
    protected renderer: Renderer2,
    private colorHash: ColorHashService,
    public changeDetector: ChangeDetectorRef,
    protected store: Store,
    private dialog: MatDialog,
    private readonly zone: NgZone
  ) {
    super(store);
    this.sub.add(this.smooth$
      .pipe(
        debounceTime(50),
        filter(() => !!this.chart))
      .subscribe(() => {
        this._chart = cloneDeep(this.originalChart);
        this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
      })
    );
    this.sub.add(this.drawGraph$.pipe(debounceTime(40)).subscribe(({forceRedraw, forceSkipReact}) => {
      if (this.showLoaderOnDraw) {
        this.loading = true;
        this.changeDetector.detectChanges();
      }
      const container = this.plotlyContainer.nativeElement;
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
      if ((this.plotlyContainer.nativeElement.offsetWidth !== this.previousOffsetWidth || forceSkipReact) && (root as HTMLElement).offsetHeight > 0) {
        skipReact = true;
        this.zone.runOutsideAngular(() => Plotly.relayout(root, {
          width: this.ratio ? this.height * this.ratio + RATIO_OFFSET_FIX : Math.max(getOr(0, 'data[0].cells.values.length', data) * 100, this.plotlyContainer.nativeElement.offsetWidth - 3),
          height: this.height,
        }).then(() => {
          this.loading = false;
          this.changeDetector.detectChanges();
          this.updateLegend();
        }));
      }
      this.previousOffsetWidth = this.plotlyContainer.nativeElement.offsetWidth;
      this.previousHeight = this.height;

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
          this.listenToHoverModeChange();
        });
      }
      this.alreadyDrawn = true;
    }));
  }

  listenToHoverModeChange() {
    this.plotlyContainer.nativeElement.querySelector('.chart')?.on('plotly_afterplot', () => {
      const activeBtns = this.plotlyContainer.nativeElement.querySelectorAll('.modebar-btn.active');
      if (activeBtns.length > 0) {
        activeBtns.forEach((bt => {
          if (bt.attributes['data-attr'].value === 'hovermode') {
            if (bt.attributes['data-val'].value !== this.hoverMode) {
              this._hoverMode = bt.attributes['data-val'].value;
              this.hoverModeChanged.emit(bt.attributes['data-val'].value);
            }
          }
        }));
      }
    });
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
    this.title = this.isDarkTheme ? '' : this.addIterationString(graph.layout.title as string, graph.iter) || (graph.layout.title as Record<string, any>).text;
    let layout = {
      ...this.addParametersIfDarkTheme({
        font: {
          color: '#FFFFFF',
          family: '"Heebo", sans-serif',
        }
      }),
      ...graph.layout,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...this.addParametersIfDarkTheme({plot_bgcolor: 'transparent'}),
      height: this.height,
      width: this.ratio ? (this.height * this.ratio) + RATIO_OFFSET_FIX : undefined,
      modebar: {
        color: '#5a658e',
        activecolor: '#4D66FF',
        ...this.addParametersIfDarkTheme({
          color: PALLET.blue300,
          activecolor: PALLET.blue100,
          bgcolor: 'transparent',
        }),
      },
      title: {
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
          ...graph.layout.xaxis,
        },
        yaxis: {
          color: DARK_THEME_GRAPH_LINES_COLOR,
          gridcolor: DARK_THEME_GRAPH_LINES_COLOR,
          zerolinecolor: DARK_THEME_GRAPH_LINES_COLOR,
          tickfont: {
            color: DARK_THEME_GRAPH_TICK_COLOR
          },
          ...graph.layout.yaxis,
        }
      }),
      uirevision: 'static', // Saves the UI state between redraws https://plot.ly/javascript/uirevision/
      hoverlabel: {namelength: -1},
      legend: {
        traceorder: 'normal',
        xanchor: 'left',
        yanchor: 'top',
        ...(this.moveLegendToTitle ? {
          y: 1,
          orientation: 'v',
        } : {
          orientation: 'h',
          y: -0.2
        }),
        borderwidth: 2,
        bordercolor: '#FFFFFF',
        valign: 'top',
        font: {color: '#000', size: 12, family: 'sans-serif'},
        ...this.addParametersIfDarkTheme({
          bgcolor: 'transparent',
          bordercolor: 'transparent',
          font: {color: '#dce0ee', size: 12, family: 'sans-serif'},
        }),
        ...this.legendConfiguration,
        ...graph.layout.legend,
      },
      showlegend: this.chartElm.layout && Object.prototype.hasOwnProperty.call(this.chartElm.layout, 'showlegend') ? this.chartElm.layout.showlegend : graph.layout?.showlegend !== false,
      margin: graph.layout.margin ? graph.layout.margin : this.noMargins ? {
        l: 50,
        r: 50,
        t: 50,
        b: 50,
        pad: 0,
        autoexpand: true
      } : {
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
        line: {width: 1, color: this.isDarkTheme ? '#5a658e' : '#d4d6e0'},
        height: 29,
        align: 'left',
        font: {
          color: [this.isDarkTheme ? PALLET.blue200 : PALLET.blue400],
          size: 12
        },
        fill: {...graph.data[0].header?.fill, color: this.isDarkTheme ? PALLET.blue800 : PALLET.blue50}
      };

      // override cells design
      const isFireFox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      graph.data[0].cells = {
        ...graph.data[0].cells,
        align: 'left',
        height: (isFireFox && this.isDarkTheme) ? 'auto' : 30,
        font: {
          color: [this.isDarkTheme ? PALLET.blue200 : PALLET.blue400],
          size: 12
        },
        fill: {...graph.data[0].cells, color: this.isDarkTheme ? PALLET.blue950 : '#ffffff'},
        line: {width: 1, color: this.isDarkTheme ? DARK_THEME_GRAPH_LINES_COLOR : PALLET.blue100}
      };
      layout.width = Math.max(getOr(0, 'data[0].cells.values.length', graph) * 100, this.plotlyContainer.nativeElement.offsetWidth - 3);
      layout.title = {
        ...layout.title as Record<string, any>,
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
        layout = {hovermode: this.hoverMode, ...layout, ...scatterLayoutConfig} as Partial<ExtLayout>;
      }
    }
    if (['bar'].includes(this.type)) {
      layout = {...layout, ...barLayoutConfig} as Partial<ExtLayout>;
    }

    const modeBarButtonsToAdd = ['v1hovermode', 'togglespikelines'] as undefined as ModeBarButton[];

    if (['multiScalar', 'scalar'].includes(graph.layout.type)) {
      modeBarButtonsToAdd.push({
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
            this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
          }, 400);
        }
      });
    }
    if (!['table', 'parcoords'].includes(get('data[0].type', graph)) && graph.layout?.showlegend !== false && !this.moveLegendToTitle) {
      modeBarButtonsToAdd.push({
        name: 'Hide legend',
        title: this.getHideButtonTitle(),
        icon: this.getToggleLegendIcon(),
        click: (element, ev: MouseEvent) => {
          const pathElement = (ev.target as HTMLElement).tagName === 'path' ? (ev.target as HTMLElement) : (ev.target as HTMLElement).querySelector('path');
          const svg = pathElement.parentElement;
          pathElement.style.fill = this.chartElm.layout?.showlegend ? 'rgb(77, 102, 255)' : 'rgb(143, 157, 201)';
          svg.parentElement.attributes['data-title'].value = this.getHideButtonTitle();
          this.chartElm.layout.showlegend = !this.chartElm.layout.showlegend;
          if (this.chartElm.layout.showlegend) {
            setTimeout(() => {
              this.subscribeColorButtons(this.plotlyContainer.nativeElement);
              this.updateLegend();
            }, 20);
          }
          this.zone.runOutsideAngular(() => Plotly.relayout(this.chartElm, {showlegend: this.chartElm.layout.showlegend}));
        }
      });
    }
    if (!['table', 'parcoords'].includes(get('data[0].type', graph)) && this.ratioEnable && !this.moveLegendToTitle) {
      modeBarButtonsToAdd.push({
        name: 'Auto Layout',
        title: 'Auto Layout',
        icon: this.getToggleRatioIcon(),
        click: (element, ev: MouseEvent) => {
          const pathElement = (ev.target as HTMLElement).tagName === 'path' ? (ev.target as HTMLElement) : (ev.target as HTMLElement).querySelector('path');
          const svg = pathElement.parentElement;
          pathElement.style.fill = this.ratio ? 'rgb(77, 102, 255)' : 'rgb(143, 157, 201)';
          svg.parentElement.attributes['data-title'].value = this.getLockRatioTitle();
          this.ratio = this.ratio ? null : this.originalChart.layout.width / this.originalChart.layout.height;
          this.drawGraph$.next({forceRedraw: true, forceSkipReact: true});
        }
      });
    }
    modeBarButtonsToAdd.push({
      name: 'Download JSON',
      title: 'Download JSON',
      icon: this.getJsonDownloadIcon(),
      click: () => {
        this.downloadGraphAsJson(cloneDeep(this.originalChart));
      }
    });
    if (this.type === 'table') {
      modeBarButtonsToAdd.push({
        name: 'Download CSV',
        title: 'Download CSV',
        icon: this.getCSVDownloadIcon(),
        click: () => {
          this.downloadTableAsCSV();
        }
      });
    }

    if (this.exportForReport) {
      const button: ModeBarButton = {
        name: 'Embed',
        title: 'Copy to Report',
        attr: 'plotly-embedded-modebar-button',
        icon: this.getEmbedIcon(),
        click: () => {
          this.createEmbedCode.emit();
        }
      };
      modeBarButtonsToAdd.push(button);
    }

    if (this.hideMaximize !== 'hide') {
      const maximizeButton: ModeBarButton = {
        name: 'Maximize',
        title: this.hideMaximize === 'disabled' ? `Can't maximize because an iframe with the same name exists`: 'Maximize Graph',
        attr: this.hideMaximize === 'disabled' ? 'plotly-disabled-maximize' : '',
        icon: this.getMaximizeIcon(),
        click: () => {
          this.hideMaximize !== 'disabled' && this.maximizeGraph();
        }
      };
      modeBarButtonsToAdd.push(maximizeButton);
    }

    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'] as ModeBarDefaultButtons[],
      displaylogo: false,
      modeBarButtonsToAdd
    };

    return [this.chartElm, graph.data, layout, config, this.chartData];
  }

  private updateLegend() {
    const graph = select(this.plotlyContainer.nativeElement);
    graph.selectAll('.legendpoints path')
      .attr('d', 'M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z');
    graph.selectAll('.legendtoggle')
      .on('click', () => window.setTimeout(() => graph.selectAll('.legendpoints path')
        .attr('d', 'M5.5,0A5.5,5.5 0 1,1 0,-5.5A5.5,5.5 0 0,1 5.5,0Z'), 300)
      );
  }

  private formatChartLines() {
    if (this.alreadyDrawn || !this.chart) {
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
        const genColorKey = this.generateColorKey(graph, i);
        const wrappedText = this.legendConfiguration.noTextWrap || this.scaleFactor === 100 ?
          graph.data[i].name :
          wordWrap(graph.data[i].name, this.legendStringLength / 2);
        const skipColor = !!this.getOriginalColor(i) ? ORIGIN_COLOR : '';
        graph.data[i].name = wrappedText + `<span style="display: none;" class="color-key" data-color-key="${genColorKey}" ${skipColor}></span>`;
      }
      const colorKey = this.extractColorKey(graph.data[i].name);
      const originalColor = this.getOriginalColor(i);
      if (!Array.isArray(originalColor)) {
        const color = (originalColor && !this.colorHash.hasColor(colorKey)) ? hexToRgb(this.getOriginalColor(i)) : this.colorHash.initColor(colorKey);
        // if (this.colorHash.hasColor(colorKey)) { // We don't save init color in color cache, so we need to recolor everytime
        this._reColorTrace(graph.data[i], color);
        // }
        if (this.isSmooth && !graph.data[i].isSmoothed) {
          graph.data[i].legendgroup = graph.data[i].name;
          graph.data[i].showlegend = false;
          graph.data[i].hoverinfo = 'skip';
          smoothLines.push(this.resmoothDataset(graph.data[i], color));
        }
      }
    }
    this.setAxisText(graph, timeUnit);
    graph.data = graph.data.filter(line => !line.isSmoothed);
    graph.data = graph.data.concat(smoothLines);
    return graph;
  }

  private getOriginalColor(i: number) {
    return this.originalChart.data[i]?.marker?.color || this.originalChart.data[i]?.line?.color;
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

  private resmoothDataset(data: ExtData, color) {
    let last = data.y?.[0] as number ?? NaN;

    return {
      ...data,
      line: {...data.line, color: `rgb(${color[0]},${color[1]},${color[2]})`},
      legendgroup: data.name,
      name: `${data.name} (Smoothed)`,
      showlegend: true,
      isSmoothed: true,
      hovertext: data.hovertext ? data.hovertext + '(Smoothed)' : '(Smoothed)',
      hoverinfo: 'all',
      y: data.y.map((d) => {
        if (!isFinite(last)) {
          return null;
        } else {
          // 1st-order IIR low-pass filter to attenuate the higher-
          // frequency components of the time-series.
          last = last * this.smoothWeight + (1 - this.smoothWeight) * d;
          return last;
        }
      })
    } as ExtData;
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
          const colorKey = this.extractColorKey(name);
          if (!name || !this.colorHash.hasColor(colorKey)) {
            return;
          }
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
    this.repositionModeBar(this.plotlyContainer.nativeElement);
    if (this.moveLegendToTitle) {
      const graphTitle = container.querySelector('.gtitle') as SVGTextElement;
      if (graphTitle) {
        const endOfTitlePosition = (
          (this.plotlyContainer.nativeElement.offsetWidth / 2) +
          (graphTitle.getClientRects()[0].width * this.scaleFactor / 200)
        );
        const legend = container.querySelector('.legend') as SVGGElement;
        legend.style.transform = `translate(${endOfTitlePosition}px, 30px)`;
        legend.classList.add('hide-text');
      }
    }
    const traces = container.querySelectorAll('.traces');
    for (const trace of traces) {
      const textEl = trace.querySelector('.legendtext') as SVGTextElement;
      const textElData = textEl.getAttribute('data-unformatted');
      const text = textEl ? this.extractColorKey(textElData) : '';
      // const skipColor = textElData.includes(ORIGIN_COLOR);

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
      chart.layout.xaxis.title = {text: title, standoff: 10};
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
    const exportName = `${chart.layout.title} - ${this.getAxisText(timeUnit) || chart.layout.name}.json`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chart.data));
    download(dataStr, exportName);
  }

  getJsonDownloadIcon() {
    return {
      path: 'M21,6H15V0ZM14,7h7V22a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V2A2,2,0,0,1,5,0h9Zm1.34,13.22h.58a2.09,2.09,0,0,0,1.3-.28,1.59,1.59,0,0,0,.32-1.16v-.84a1.14,1.14,0,0,1,.22-.81,1,1,0,0,1,.76-.23h.24v-.74h-.24a1,1,0,0,1-.76-.23,1.14,1.14,0,0,1-.22-.81v-.84a1.55,1.55,0,0,0-.32-1.15,2.08,2.08,0,0,0-1.3-.29h-.58v.74h.47a.71.71,0,0,1,.55.17,1.25,1.25,0,0,1,.14.72v.82a1.54,1.54,0,0,0,.19.9.94.94,0,0,0,.68.34,1,1,0,0,0-.68.35,1.56,1.56,0,0,0-.19.9v.8a1.27,1.27,0,0,1-.14.73.72.72,0,0,1-.55.17h-.47ZM9.11,12.84H8.53a2.12,2.12,0,0,0-1.31.29,1.5,1.5,0,0,0-.33,1.15v.84a1.29,1.29,0,0,1-.2.82,1.08,1.08,0,0,1-.76.22H5.69v.74h.24a1,1,0,0,1,.76.23,1.26,1.26,0,0,1,.2.81v.84a1.54,1.54,0,0,0,.33,1.16,2.13,2.13,0,0,0,1.31.28h.58v-.74H8.63a.68.68,0,0,1-.54-.17A1.27,1.27,0,0,1,8,18.58v-.8a1.56,1.56,0,0,0-.19-.9,1,1,0,0,0-.68-.35,1,1,0,0,0,.68-.34,1.54,1.54,0,0,0,.19-.9v-.82a1.25,1.25,0,0,1,.14-.72.68.68,0,0,1,.54-.17h.48Zm4,1.7H10.83v.88H12v3.33a1.21,1.21,0,0,1-.16.73.61.61,0,0,1-.54.22h-.91v.88h1.23a1.44,1.44,0,0,0,1.17-.42,2.17,2.17,0,0,0,.36-1.41Zm0-2.12H12v1.33h1.15Z',
      width: 24,
      height: 24
    };
  }

  getCSVDownloadIcon() {
    return {
      path: 'M15,6V0l6,6Zm6,1V22a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V2A2,2,0,0,1,5,0h9V7ZM8.83,14.28a2.78,2.78,0,0,0-.57-.21A2.67,2.67,0,0,0,7.62,14a2.18,2.18,0,0,0-1.8.78A3.57,3.57,0,0,0,5.2,17a3.54,3.54,0,0,0,.62,2.24,2.18,2.18,0,0,0,1.8.78A2.59,2.59,0,0,0,8.25,20a2.66,2.66,0,0,0,.58-.21V18.49a2.42,2.42,0,0,1-.58.4,1.44,1.44,0,0,1-.57.13,1.06,1.06,0,0,1-1-.51A2.8,2.8,0,0,1,6.4,17a2.82,2.82,0,0,1,.32-1.49,1.05,1.05,0,0,1,1-.5,1.42,1.42,0,0,1,.57.12,2.42,2.42,0,0,1,.58.4Zm4.93,4a1.72,1.72,0,0,0-.33-1.08,2.27,2.27,0,0,0-1-.68l-.49-.19a2,2,0,0,1-.68-.35.52.52,0,0,1-.16-.4.55.55,0,0,1,.22-.48,1.06,1.06,0,0,1,.64-.17,2.31,2.31,0,0,1,.76.14,3,3,0,0,1,.75.4V14.36a4,4,0,0,0-.8-.27,3.57,3.57,0,0,0-.8-.09,2,2,0,0,0-1.4.45,1.61,1.61,0,0,0-.5,1.25,1.44,1.44,0,0,0,.31,1,2.87,2.87,0,0,0,1.17.7l.57.21a1,1,0,0,1,.45.31.72.72,0,0,1,.16.46.67.67,0,0,1-.23.54,1,1,0,0,1-.66.2,2.61,2.61,0,0,1-.86-.16,4,4,0,0,1-.89-.49v1.19a3.71,3.71,0,0,0,1.71.41,2.44,2.44,0,0,0,1.58-.43A1.64,1.64,0,0,0,13.76,18.3Zm5.07-4.19H17.67l-1,4.87-1-4.87H14.46l1.39,5.83h1.6Z',
      width: 24,
      height: 24,
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

  getToggleRatioIcon() {
    return {
      width: 500,
      height: 500,
      fill: 'rgb(77, 102, 255)',
      path: 'M419.3,256.4H373v69.9h-69.9v46.3h116.2V256.4z M139.8,186.5h69.9v-46.3h-117v116.2H139v-69.9H139.8z M465.7,46.7H46.3C20.6,46.7,0,68,0,93.1V419c0,25.7,20.6,46.3,46.3,46.3h419.3c25.7,0,46.3-21.3,46.3-46.3V93.1C512,68,491.4,46.7,465.7,46.7z M465.7,419.7H46.3V93.1h419.3v326.6H465.7z',
      ascent: 300,
      descent: 0,
      transform: 'translate(0, -50)'
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

  getEmbedIcon = () => ({
    width: 24,
    height: 24,
    fill: 'rgb(77, 102, 255)',
    path: 'M22,0H2C.9,0,0,.9,0,2V22c0,1.1,.9,2,2,2H22c1.1,0,2-.9,2-2V2c0-1.1-.9-2-2-2ZM8.02,9.54l-2.59,2.59,2.59,2.58v2.83L2.6,12.13l5.42-5.42v2.83Zm3.11,11.59l-1.96-.4L12.91,3.13l1.96,.4-3.74,17.6Zm4.89-3.59v-2.83l2.59-2.58-2.59-2.59v-2.83l5.42,5.42-5.42,5.41Z',
  });


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

  private getLockRatioTitle() {
    return this.ratio ? 'Original Layout' : 'Auto Layout';
  }

  private maximizeGraph() {
    this.maximizeClicked.emit();
    this.zone.run(() => {
      this.dialog.open(GraphViewerComponent, {
        data: {
          ...(this.exportForReport && {embedFunction: () => this.createEmbedCode.emit()}),
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
        panelClass: ['image-viewer-dialog', this.isDarkTheme ? 'dark-theme' : 'light-theme'],
        height: '100%',
        maxHeight: 'auto',
        width: '100%',
        maxWidth: 'auto'
      }).beforeClosed().subscribe(() => this.maximizeClicked.emit());
    });
  }

  private addParametersIfDarkTheme(object: Record<string, unknown>) {
    return this.isDarkTheme ? object : {};
  }

  private addIterationString(name: string, iter: number) {
    return name + ((iter || (this.graphsNumber > 1 && iter === 0)) ? ` - Iteration ${iter}` : '');
  }

  public repositionModeBar(singleGraphEl) {
    if (this.type === 'table') {
      this.modeBar = this.modeBar || this.chartElm.querySelector('.modebar-container');
      this.modeBar.style.right = `${singleGraphEl.scrollWidth - singleGraphEl.clientWidth - singleGraphEl.scrollLeft}px`;
    }
  }

  private downloadTableAsCSV() {
    const vals = this.chart?.data?.[0]?.cells?.values;
    const headers = this.chart?.data?.[0]?.header?.values;
    if (vals && headers) {
      let data = headers.flat().join(',') + '\n';
      for (let i = 0; i < vals[0].length; ++i) {
        for (let j = 0; j < headers.length; ++j) {
          data += `${vals[j][i]},`;
        }
        data = data.slice(0, -1) + '\n';
      }
      const exportName = `${this.chart.layout.title} - ${this.chart.layout.name}.csv`;
      data = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
      download(data, exportName);
    }
  }

  public redrawPlot() {
    this.drawGraph$.next({forceRedraw: true, forceSkipReact: false});
  };
}
