import {Component, Input} from '@angular/core';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {IExecutionForm} from '../../../../features/experiments/shared/experiment-execution.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {ImmutableFormContainer} from '../../../shared/ui-components/forms/immutableFormContainer';

@Component({
  selector   : 'sm-experiment-requirements-code',
  templateUrl: './experiment-execution-requirements.component.html',
  styleUrls  : ['./experiment-execution-requirements.component.scss'],
})
export class ExperimentExecutionRequirementsComponent extends ImmutableFormContainer implements IExperimentInfoFormComponent {
  lines: string[];

  @Input() set formData (data: IExecutionForm['requirements']) {
    this.lines = data?.pip ? data?.pip?.split('\n') : [];
  }
  @Input() isInDev: boolean = false;
  @Input() editable: boolean;

  HELP_TEXTS = HELP_TEXTS;
}
