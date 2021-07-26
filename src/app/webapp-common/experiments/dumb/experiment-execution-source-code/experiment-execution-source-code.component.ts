import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {IExecutionForm, sourceTypesEnum} from '../../../../features/experiments/shared/experiment-execution.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';

@Component({
  selector   : 'sm-experiment-execution-source-code',
  templateUrl: './experiment-execution-source-code.component.html',
  styleUrls  : ['./experiment-execution-source-code.component.scss'],
})
export class ExperimentExecutionSourceCodeComponent implements OnInit, IExperimentInfoFormComponent, OnDestroy {

  private formChangesSubscription: Subscription;
  @Input() formData: IExecutionForm['source'];
  @Input() editable: boolean;

  @Output() formDataChanged = new EventEmitter<{ field: string; value: any }>();

  @ViewChild('sourceCodeForm', { static: true }) sourceCodeForm: NgForm;

  HELP_TEXTS               = HELP_TEXTS;
  readonly sourceTypesEnum = sourceTypesEnum;

  scriptTypeOptions = [
    {
      value: sourceTypesEnum.VersionNum,
      label: 'Commit Id'
    },
    {
      value: sourceTypesEnum.Tag,
      label: 'Tag name'
    },
    {
      value: sourceTypesEnum.Branch,
      label: 'Last Commit In Branch'
    },
  ];
  scriptPlaceHolders = {
    [sourceTypesEnum.VersionNum]: 'Insert commit id',
    [sourceTypesEnum.Tag]       : 'Insert tag name',
    [sourceTypesEnum.Branch]    : 'Insert branch name',
  };
  flagNameMap = {
    [sourceTypesEnum.VersionNum]: 'COMMIT ID',
    [sourceTypesEnum.Tag]       : 'TAG NAME',
    [sourceTypesEnum.Branch]    : 'BRANCH NAME'
  };


  ngOnInit(): void {
    this.formChangesSubscription = this.sourceCodeForm.form.valueChanges.subscribe(formValue => {
      if (this.editable) {
        this.formDataChanged.emit({field: 'source', value: formValue});
      }
    });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription.unsubscribe();
  }

  resetOtherScriptParameters(sourceType: sourceTypesEnum) {
    switch (sourceType) {
      case sourceTypesEnum.VersionNum:
        this.sourceCodeForm.controls['tag'].setValue('');
        this.sourceCodeForm.controls['branch'].setValue('');
        break;
      case sourceTypesEnum.Tag:
        this.sourceCodeForm.controls['branch'].setValue('');
        this.sourceCodeForm.controls['version_num'].setValue('');
        break;
      case sourceTypesEnum.Branch:
        this.sourceCodeForm.controls['version_num'].setValue('');
        this.sourceCodeForm.controls['tag'].setValue('');
        break;
    }
  }
}
