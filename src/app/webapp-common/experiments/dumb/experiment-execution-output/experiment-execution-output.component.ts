import {Component, Input} from '@angular/core';
import {ImmutableFormContainer} from '../../../shared/ui-components/forms/immutableFormContainer';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {IExecutionForm} from '../../../../features/experiments/shared/experiment-execution.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';

@Component({
  selector: 'sm-experiment-execution-output',
  templateUrl: './experiment-execution-output.component.html',
  styleUrls: ['./experiment-execution-output.component.scss']
})
export class ExperimentExecutionOutputComponent extends ImmutableFormContainer implements IExperimentInfoFormComponent {

  @Input() formData: IExecutionForm['output'];
  @Input() editable: boolean;

  HELP_TEXTS = HELP_TEXTS;

  validators: {

  };

  errors: {

  };
}
