import {Component, Input} from '@angular/core';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {ImmutableFormContainer} from '../../../shared/ui-components/forms/immutableFormContainer';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {IHyperParamsForm} from '../../shared/experiment-hyper-params.model';

@Component({
  selector   : 'sm-experiment-hyper-params-form',
  templateUrl: './experiment-hyper-params-form.component.html',
  styleUrls  : ['./experiment-hyper-params-form.component.scss']
})
export class ExperimentHyperParamsFormComponent extends ImmutableFormContainer implements IExperimentInfoFormComponent {


  @Input() formData: IHyperParamsForm;
  @Input() editable: boolean;
  @Input() isInDev: boolean;
  @Input() saving = false;
  HELP_TEXTS      = HELP_TEXTS;

  sectionSaved() {
    this.saveFormData.emit();
  }

  sectionCancelled() {
    this.cancelFormDataChange.emit();
  }

  activateEditClicked(editMode, sectionName: string) {
    this.activateEdit.emit({editMode: editMode, sectionName: sectionName});
  }
}
