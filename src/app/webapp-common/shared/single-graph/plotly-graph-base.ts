import {Subscription} from 'rxjs';
import {Component, inject, Input, OnDestroy} from '@angular/core';
import plotly from 'plotly.js';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {Store} from '@ngrx/store';
import { TinyColor } from '@ctrl/tinycolor';

export const DARK_THEME_GRAPH_LINES_COLOR = '#39405f';
export const DARK_THEME_GRAPH_TICK_COLOR = '#c1cdf3';
export interface VisibleExtFrame extends ExtFrame {
  id: string;
  visible: boolean;
}

export interface ExtFrame extends Omit<plotly.Frame, 'data' | 'layout'> {
  iter: number;
  metric: string;
  task: string;
  timestamp: number;
  type: string;
  variant: string;
  variants?: string[];
  worker: string;
  data: ExtData[];
  layout: Partial<ExtLayout>;
  config: Partial<plotly.Config>;
  tags?: string[];
  plot_str?: string;
}

export interface ExtLegend extends plotly.Legend {
  valign: 'top' | 'middle' | 'bottom';
  itemwidth: number;
}

export interface ExtLayout extends Omit<plotly.Layout, 'legend'> {
  type: string;
  legend: Partial<ExtLegend>;
  uirevision: number | string;
  name: string;
}

export interface ExtData extends plotly.PlotData {
  task: string;
  cells: any;
  header: any;
  name: string;
  colorKey?: string;
  isSmoothed: boolean;
  colorHash: string;
  originalMetric?: string;
}

@Component({
  selector: 'sm-base-plotly-graph',
  template: ''
})
export abstract class PlotlyGraphBaseComponent implements OnDestroy {
  protected sub = new Subscription();
  protected colorSub: Subscription;
  public isSmooth = false;
  public scaleFactor: number;
  protected store: Store;

  @Input() isCompare= false;


  protected constructor() {
    this.store = inject(Store);
    this.sub.add(this.store.select(selectScaleFactor).subscribe(scaleFactor => this.scaleFactor = scaleFactor));
  }

  public _reColorTrace(trace: ExtData, newColor: number[]): void {
    if (Array.isArray(trace.line?.color) || Array.isArray(trace.marker?.color)) {
      return;
    }
    const colorString = new TinyColor({r: newColor[0], g: newColor[1], b: newColor[2]})
      .lighten((this.isSmooth && !trace.isSmoothed) ? 20 : 0).toRgbString();
    if (trace.marker) {
      trace.marker.color = colorString;
      if (trace.marker.line) {
        trace.marker.line.color = colorString;
      }
    }
    if (trace.line) {
      trace.line.color = colorString;
    }  else {
      // Guess that a graph without a lne or a marker should have a line, may cause havoc
      trace.line = {};
      trace.line.color = colorString;
    }
  }

  public _getTraceColor(trace: ExtData): string {
    if (trace.line) {
      return trace.line.color as string;
    }
    if (trace.marker) {
      return trace.marker.color as string;
    }
    return '';
  }

  public addIdToDuplicateExperiments(chart: ExtFrame): ExtData[] {
    const data = chart.data;
    const taskId = chart.task;
    const namesHash = {};
    for (let i = 0; i < data.length; i++) {
      if (!data[i].name || data[i].name === chart.variant || data[i].name.endsWith('</span>')) {
        continue;
      }
      const name = data[i].name;
      if (namesHash[name] && name !== data[i].legendgroup) {
        namesHash[name].push(i);
      } else {
        namesHash[name] = [i];
      }
    }
    const filtered = Object.entries(namesHash).filter((entry: any) => entry[1].length > 1);
    const duplicateIndexes = filtered.reduce((acc, entry: any) => acc.concat(entry[1]), []);
    const merged = [...duplicateIndexes];

    for (const key of merged) {
      data[key].colorHash = data[key].name;
      // Warning: "data[key].task" in compare case. taskId in subplots (multiple plots with same name)
      if (data[key].task || taskId) {
        data[key].name = `${data[key].name}.${(data[key].task || taskId).substring(0, 6)}`;
      }
    }
    return data;
  }

  public extractColorKey(html: string): string[] {
    const div = document.createElement('div');
    div.innerHTML = html;
    const el = div.querySelector('.color-key');
    const orgColor = el?.getAttribute('data-origin-color');
    return el ? [el.getAttribute('data-color-key'), orgColor === 'undefined' ? null : orgColor] : ['', ''];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.colorSub?.unsubscribe();
  }

}
