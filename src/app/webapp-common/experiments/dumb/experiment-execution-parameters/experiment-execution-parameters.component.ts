import {Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy} from '@angular/core';
import {IExecutionParameter} from '../../shared/experiment-hyper-params.model';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {cloneDeep, isEqual} from 'lodash/fp';
import {v4 as uuidV4} from 'uuid';
import {NgForm} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {Subscription} from 'rxjs';


@Component({
  selector   : 'sm-experiment-execution-parameters',
  templateUrl: './experiment-execution-parameters.component.html',
  styleUrls  : ['./experiment-execution-parameters.component.scss']
})
export class ExperimentExecutionParametersComponent implements IExperimentInfoFormComponent, OnInit, OnDestroy {

  public form: IExecutionParameter[];
  @ViewChild('hyperParameters', {static: true}) hyperParameters: NgForm;
  @Output() formDataChanged = new EventEmitter<{ field: string, value: Array<any> }>();
  private formChangesSubscription: Subscription;

  @Input() set formData(data: IExecutionParameter[]) {
    if (!isEqual(data, this.form)) {
      this.form = cloneDeep(data).map((row: IExecutionParameter) => ({...row, id: uuidV4()}));
      this.hyperParameters.form.updateValueAndValidity();
    }
  }

  get formData() {
    return this.form;
  }

  @Input() editable: boolean;

  HELP_TEXTS  = HELP_TEXTS;
  public cols = [
    [
      {header: 'KEY', class: 'col-11'},
      {header: 'LABEL', class: 'col-11'},
      {header: '', class: 'col-2'}
    ]
  ];

  addRow() {
    this.formData.push({
      id   : uuidV4(),
      key  : null,
      label: null
    });
  }

  removeRow(index) {
    this.formData.splice(index, 1);
  }

  ngOnInit(): void {
    this.formChangesSubscription = this.hyperParameters.valueChanges.pipe(debounceTime(10)).subscribe(formValue => {
      if (this.editable) {
        this.formDataChanged.emit({field: 'parameters', value: this.formData});
      }
    });
  }

  ngOnDestroy() {
    this.formChangesSubscription && this.formChangesSubscription.unsubscribe();
  }
}
