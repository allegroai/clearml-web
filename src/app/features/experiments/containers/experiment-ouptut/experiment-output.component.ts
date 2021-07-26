import {Component} from '@angular/core';
import {BaseExperimentOutputComponent} from '../../../../webapp-common/experiments/containers/experiment-ouptut/base-experiment-output.component';

@Component({
  selector: 'sm-experiment-output',
  templateUrl: './experiment-output.component.html',
  styleUrls: ['../../../../webapp-common/experiments/containers/experiment-ouptut/base-experiment-output.component.scss']
})
export class ExperimentOutputComponent extends BaseExperimentOutputComponent {
  public overflow: boolean;
}
