import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '../../../../features/experiments/shared/experiments.const';
import {IExperimentDetail} from '../../../../features/experiments-compare/experiments-compare-models';
import {TIME_FORMAT_STRING} from '../../../constants';

@Component({
  selector: 'sm-experiment-compare-general-data',
  templateUrl: './experiment-compare-general-data.component.html',
  styleUrls: ['./experiment-compare-general-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareGeneralDataComponent {

  public EXPERIMENTS_STATUS_LABELS = EXPERIMENTS_STATUS_LABELS;

  @Input() experiment: IExperimentDetail;
  @Input() isOrigin: boolean = false;
  @Input() tags: string[];
  @Output() copyIdClicked = new EventEmitter();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  copyToClipboard() {
    this.copyIdClicked.emit();
  }

  buildUrl() {
    return `/projects/${this.experiment.project ? this.experiment.project.id : '*'}/experiments/${this.experiment.id}`;
  }
}
