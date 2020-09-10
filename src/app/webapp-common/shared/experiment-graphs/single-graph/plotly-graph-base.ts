import {hslToRgb, rgbToHsl} from '../../services/color-hash/color-hash.utils';
import {Subscription} from 'rxjs';
import {Input, OnDestroy, Directive, Renderer2, ElementRef} from '@angular/core';
import {Data, Frame, Layout, LayoutAxis, Legend, PlotData} from 'plotly.js';
import {selectScaleFactor} from '../../../core/reducers/view-reducer';
import {Store} from '@ngrx/store';

export interface ExtFrame extends  Omit<Frame, 'data' | 'layout'> {
  iter: number;
  metric: string;
  task: string;
  timestamp: number;
  type: string;
  worker: string;
  data: ExtData[];
  layout: ExtLayout;
}

export interface ExtLegend extends Legend {
  valign:  'top' | 'middle' | 'bottom';
}

export interface ExtLayoutAxis extends Omit<LayoutAxis, 'spikesnap'> {
  spikesnap: string;
}

export interface ExtLayout extends Omit<Layout, 'xaxis'|'yaxis'|'legend'> {
  type: PlotData['type'];
  xaxis: Partial<ExtLayoutAxis>;
  yaxis: Partial<ExtLayoutAxis>;
  legend: Partial<ExtLegend>;
  uirevision: number | string;
}

interface ExtData extends Data {
  task: string;
  cells: any;
  header: any;
}

@Directive({
  selector: 'base-plotly-graph'
})
export class PlotlyGraphBase implements OnDestroy {
  public isSmooth = false;
  public colorSub: Subscription;
  @Input() isCompare: boolean = false;
  protected dimension: number;
  protected scale: number;
  private scaleSub: Subscription;

  constructor(
    protected store: Store,
    protected renderer: Renderer2,
    protected elementRef: ElementRef
  ) {
    this.scaleSub = store.select(selectScaleFactor).subscribe(scaleFactor => {
      if (scaleFactor !== 100) {
        this.dimension = 1 / scaleFactor * 10000;
        this.scale = scaleFactor / 100;
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform', `scale(${this.scale})`);
        this.renderer.setStyle(this.elementRef.nativeElement, 'transform-origin', '50% 0%');
        this.renderer.setStyle(this.elementRef.nativeElement, 'min-height', '600px');
        this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${this.dimension}%`);
      }
    });
  }

  public _reColorTrace(trace, newColor: string[]) {
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
  public _getTraceColor(trace: any) {
    if (trace.line) {
      return trace.line.color;
    }
    if (trace.marker) {
      return trace.marker.color;
    }
    return '';
  }

  public addIdToDuplicateExperiments(data: ExtData[], taskId: string) {
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
    const merged = [].concat.apply([], duplicateIndexes);

    for (let i = 0; i < merged.length; i++) {
      const key = merged[i];

      // Warning: "data[key].task" in compare case. taskId in subplots (multiple plots with same name)
      if (data[key].task || taskId) {
        data[key].name = `${data[key].name}.${(data[key].task || taskId).substring(0, 7)}`;
      }
    }
    return data;
  }

  public extractColorKey(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const el = div.querySelector('.color-key');
    return el ? el.getAttribute('data-color-key') : '';
  }

  ngOnDestroy(): void {
    this.colorSub?.unsubscribe();
    this.scaleSub?.unsubscribe();
  }

}
