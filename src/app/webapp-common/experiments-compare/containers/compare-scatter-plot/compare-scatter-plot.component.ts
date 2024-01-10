import {Component, ElementRef, inject, Input, OnChanges} from '@angular/core';
import {ScatterPlotSeries} from '@common/core/reducers/projects.reducer';
import {
  ExtraTask
} from '@common/experiments-compare/dumbs/parallel-coordinates-graph/parallel-coordinates-graph.component';
import {get} from 'lodash-es';
import {from} from 'rxjs';
import domtoimage from 'dom-to-image';
import {take} from 'rxjs/operators';


@Component({
  selector: 'sm-compare-scatter-plot',
  templateUrl: './compare-scatter-plot.component.html',
  styleUrls: ['./compare-scatter-plot.component.scss']
})
export class CompareScatterPlotComponent implements OnChanges {

  public graphData: ScatterPlotSeries[];
  public scalar: boolean;

  @Input() metric: string;
  @Input() metricName!: string;
  @Input() params: string | string[];
  @Input() experiments: ExtraTask[];

  private ref = inject(ElementRef);


  ngOnChanges(): void {
    this.scalar = true;
    if (this.experiments && this.params && this.metric) {
      this.graphData = [{
        label: '',
        backgroundColor: '#14aa8c',
        data: this.experiments
          .map(point => [point, get(point.hyperparams, Array.isArray(this.params) ? `${this.params[0]}.value` : this.params)])
          .filter(([, param]) => param !== undefined)
          .map(([point, param]) => {
            const numericParam = parseFloat(param);
            if (isNaN(numericParam)) {
              this.scalar = false;
            }
            return {
              x: isNaN(numericParam) ? numericParam : param,
              y: get(point.last_metrics, this.metric),
              id: point.id,
              name: point.name,
            };
          }),
      } as ScatterPlotSeries];
    }
  }

  downloadImage() {
    from(domtoimage.toBlob(this.ref.nativeElement))
      .pipe(take(1))
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `Hyperparam scatter ${Array.isArray(this.params) ? this.params[0] : this.params} x ${this.metric}`;
        a.click();
      });
  }
}
