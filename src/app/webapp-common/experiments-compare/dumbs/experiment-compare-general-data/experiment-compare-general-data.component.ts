import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';
import {IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {TIME_FORMAT_STRING} from '@common/constants';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'sm-experiment-compare-general-data',
  templateUrl: './experiment-compare-general-data.component.html',
  styleUrls: ['./experiment-compare-general-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareGeneralDataComponent {

  public experimentsStatusLabels = EXPERIMENTS_STATUS_LABELS;

  @Input() experiment: IExperimentDetail;
  @Input() isOrigin: boolean = false;
  @Input() tags: string[];
  @Output() copyIdClicked = new EventEmitter();
  timeFormatString = TIME_FORMAT_STRING;

  constructor(private route: ActivatedRoute) {
  }

  copyToClipboard() {
    this.copyIdClicked.emit();
  }

  buildUrl() {
    const projectOrPipeline = this.route.root.firstChild.routeConfig.path.replace('datasets', 'datasets/simple/');
    return [`/${projectOrPipeline}`, this.experiment.project?.id || '*', 'experiments', this.experiment.id];
  }
}
