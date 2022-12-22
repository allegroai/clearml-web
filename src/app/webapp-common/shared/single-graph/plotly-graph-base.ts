import {hslToRgb, rgbToHsl} from '../services/color-hash/color-hash.utils';
import {Subscription} from 'rxjs';
import {Input, OnDestroy, Component} from '@angular/core';
import {Config, Frame, Layout, LayoutAxis, Legend, PlotData} from 'plotly.js';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {Store} from '@ngrx/store';

export interface VisibleExtFrame extends ExtFrame {
  id: string;
  visible: boolean;
}

export interface ExtFrame extends Omit<Frame, 'data' | 'layout'> {
  iter: number;
  metric: string;
  task: string;
  timestamp: number;
  type: string;
  variant: string;
  worker: string;
  data: ExtData[];
  layout: Partial<ExtLayout>;
  config: Partial<Config>;
}

export interface ExtLegend extends Legend {
  valign: 'top' | 'middle' | 'bottom';
  itemwidth: number;
}

export interface ExtLayoutAxis extends Omit<LayoutAxis, 'spikesnap'> {
  spikesnap: string;
}

export interface ExtLayout extends Omit<Layout, 'xaxis' | 'yaxis' | 'legend'> {
  type: string;
  xaxis: Partial<ExtLayoutAxis>;
  yaxis: Partial<ExtLayoutAxis>;
  legend: Partial<ExtLegend>;
  uirevision: number | string;
  name: string;
}

export interface ExtData extends PlotData {
  task: string;
  cells: any;
  header: any;
  name: string;
  isSmoothed: boolean;
  colorHash: string;
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

  @Input() isCompare: boolean = false;


  protected constructor(protected store: Store) {
    this.sub.add(store.select(selectScaleFactor).subscribe(scaleFactor => this.scaleFactor = scaleFactor));
  }

  public _reColorTrace(trace: ExtData, newColor: number[]): void {
    if (Array.isArray(trace.line?.color) || Array.isArray(trace.marker?.color)) {
      return;
    }
    let colorString = `rgb(${newColor[0]},${newColor[1]},${newColor[2]})`;
    if (this.isSmooth && !trace.isSmoothed) {
      const colorHSL = rgbToHsl(newColor);
      colorHSL[2] = Math.min(colorHSL[2] + 0.3, 0.9);
      const lighterColor = hslToRgb(colorHSL);
      colorString = `rgb(${lighterColor[0]},${lighterColor[1]},${lighterColor[2]})`;
    }
    if (trace.line) {
      trace.line.color = colorString;
    } else if (trace.marker) {
      trace.marker.color = colorString;
    } else {
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

  public addIdToDuplicateExperiments(data: ExtData[], taskId: string): ExtData[] {
    const namesHash = {};
    for (let i = 0; i < data.length; i++) {
      if (!data[i].name) {
        continue;
      }
      const name = data[i].name;
      if (namesHash[name]) {
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
        data[key].name = `${data[key].name}.${(data[key].task || taskId).substring(0, 7)}`;
      }
    }
    return data;
  }

  public extractColorKey(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const el = div.querySelector('.color-key');
    return el ? el.getAttribute('data-color-key') : '';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.colorSub?.unsubscribe();
  }

}
