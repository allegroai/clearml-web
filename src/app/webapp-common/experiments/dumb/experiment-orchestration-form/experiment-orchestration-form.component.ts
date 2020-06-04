import {ChangeDetectionStrategy, Component, forwardRef} from '@angular/core';
import {TemplateFormSectionBase} from '../../../shared/ui-components/template-forms-ui/templateFormSectionBase';
import {NG_VALUE_ACCESSOR} from '@angular/forms';


@Component({
  selector: 'sm-experiment-orchestration-form',
  templateUrl: './experiment-orchestration-form.component.html',
  styleUrls  : ['./experiment-orchestration-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExperimentOrchestrationFormComponent),
      multi: true
    }]
})
export class ExperimentOrchestrationFormComponent extends TemplateFormSectionBase {

  constructor() {
    super();
  }

}
