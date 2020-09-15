import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {IExecutionForm} from '../../../../features/experiments/shared/experiment-execution.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {Subscription} from 'rxjs';
import {TextareaControlComponent} from '../../../shared/ui-components/forms/textarea-control/textarea-control.component';

@Component({
  selector   : 'sm-experiment-diff',
  templateUrl: './experiment-execution-diff.component.html',
  styleUrls  : ['./experiment-execution-diff.component.scss'],
})
export class ExperimentExecutionDiffComponent implements IExperimentInfoFormComponent {

  lines: string[];
  @Input() set formData(data: IExecutionForm['diff']) {
    this.lines = data ? data.split('\n') : [];
  }

  @Input() isInDev: boolean    = false;
  private _editable: boolean;
  @Input() set editable(editable: boolean) {
    this._editable = editable;
  }
  get editable() {
    return this._editable;
  }
  @Input() showSpinner: boolean;
  @Output() freezeForm         = new EventEmitter();
  @Output() formDataChanged = new EventEmitter<{ field: string; value: any }>();
  HELP_TEXTS                   = HELP_TEXTS;

}
