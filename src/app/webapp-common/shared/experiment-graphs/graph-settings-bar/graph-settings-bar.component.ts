import {ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MatSelectChange} from '@angular/material/select';
import {GroupByCharts} from '@common/experiments/actions/common-experiment-output.actions';
import {SmoothTypeEnum, smoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';

@Component({
  selector: 'sm-graph-settings-bar',
  templateUrl: './graph-settings-bar.component.html',
  styleUrls: ['./graph-settings-bar.component.scss']
})
export class GraphSettingsBarComponent {
  readonly scalarKeyEnum = ScalarKeyEnum;
  readonly round = Math.round;
  protected readonly smoothTypeEnum = smoothTypeEnum;
  private el = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  public shortMode: boolean;

  @Input() set splitSize(splitSize: number) {
    this.shortMode = this.el.nativeElement.clientWidth < 1200;
  }

  @Input() smoothWeight: number;
  @Input() smoothType: SmoothTypeEnum;
  @Input() xAxisType: ScalarKeyEnum = ScalarKeyEnum.Iter;
  @Input() groupBy: GroupByCharts = 'metric';
  @Input() groupByOptions: { name: string; value: GroupByCharts }[];
  @Input() verticalLayout: boolean = false;
  @Output() changeWeight = new EventEmitter<number>();
  @Output() changeSmoothType = new EventEmitter<SmoothTypeEnum>();
  @Output() changeXAxisType = new EventEmitter<ScalarKeyEnum>();
  @Output() changeGroupBy = new EventEmitter<GroupByCharts>();
  @Output() toggleSettings = new EventEmitter();

  @HostListener('window:resize')
  onResize() {
    this.shortMode = this.el.nativeElement.clientWidth < 1130;
  }

  xAxisTypeOption = [
    {
      name: 'Iterations',
      value: ScalarKeyEnum.Iter
    },
    {
      name: 'Time from start',
      value: ScalarKeyEnum.Timestamp
    },
    {
      name: 'Wall time',
      value: ScalarKeyEnum.IsoTime
    },
  ];

  xAxisTypeChanged(key: MatSelectChange) {
    this.changeXAxisType.emit(key.value);
  }

  groupByChanged(key: MatSelectChange) {
    this.changeGroupBy.emit(key.value);
  }

  selectSmoothType($event: MatSelectChange) {
    this.changeWeight.emit([smoothTypeEnum.exponential, smoothTypeEnum.any].includes($event.value) ? 0 : 10);
    this.changeSmoothType.emit($event.value);
  }

  trimToLimits(value: number) {
    if (value === 0) {
      return;
    }
    if (value === null) {
      this.changeWeight.emit(this.smoothWeight);
      return;
    }
    if (value > (this.smoothType === smoothTypeEnum.exponential ? 0.999 : 100) || value < (this.smoothType === smoothTypeEnum.exponential ? 0 : 1)) {
      this.smoothWeight = null;
    }
    setTimeout(() => {
      if (this.smoothType === smoothTypeEnum.exponential) {
        if (value > 0.999) {
          this.smoothWeight = 0.999;
        } else if (value < 0) {
          this.smoothWeight = 0;
        }
      } else {
        if (value > 100) {
          this.smoothWeight = 100;
        } else if (value < 1) {
          this.smoothWeight = 1;
        }
      }
      this.cdr.detectChanges();
      this.changeWeight.emit(this.smoothWeight);
    });
  }
}
