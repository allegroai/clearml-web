import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperIcon,
  MatStepperNext,
  MatStepperPrevious
} from '@angular/material/stepper';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS, MatError,
  MatFormField,
  MatFormFieldDefaultOptions,
  MatLabel
} from '@angular/material/form-field';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatInput} from '@angular/material/input';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {IOption} from '@common/constants';
import {
  PaginatedEntitySelectorComponent
} from '@common/shared/components/paginated-entity-selector/paginated-entity-selector.component';
import {Store} from '@ngrx/store';
import {selectQueuesList} from '@common/experiments/shared/components/select-queue/select-queue.reducer';
import {NgTemplateOutlet} from '@angular/common';
import {MatDialogRef} from '@angular/material/dialog';
import {getQueuesForEnqueue} from '@common/experiments/shared/components/select-queue/select-queue.actions';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {toSignal} from '@angular/core/rxjs-interop';
import {Queue} from '~/business-logic/model/queues/queue';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';


export interface createExperimentDialogResult {
  id?: string;
  action: 'save' | 'run';
  name: string;
  repo: string;
  type: 'branch' | 'commit' | 'tag';
  branch: string;
  commit: string;
  tag: string;
  directory: string;
  script: string;
  taskInit: boolean;
  args: {key: string; value: string}[];
  poetry: boolean;
  binary: string;
  venv: string;
  requirements: 'skip' | 'text' | 'manual';
  pip: string;
  docker : {
    image?: string;
    args?: string;
    script?: string;
  }
  queue?: Queue;
  output?: string;
}



@Component({
  selector: 'sm-create-experiment-dialog',
  templateUrl: './create-experiment-dialog.component.html',
  styleUrl: './create-experiment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatStepper,
    MatStep,
    MatFormField,
    ReactiveFormsModule,
    DialogTemplateComponent,
    MatStepperPrevious,
    MatStepLabel,
    MatStepperNext,
    MatInput,
    MatLabel,
    LabeledFormFieldDirective,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    PaginatedEntitySelectorComponent,
    MatStepperIcon,
    NgTemplateOutlet,
    FilterPipe,
    MatError,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {subscriptSizing: 'dynamic', appearance: 'outline', floatLabel: 'always'} as MatFormFieldDefaultOptions
    },
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: {disabled: true} as RippleGlobalOptions}
  ]
})
export class CreateExperimentDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialogRef);

  protected queues = this.store.selectSignal(selectQueuesList);

  protected gitTypes = ['branch', 'commit', 'tag'];
  protected scriptTypes = ['script', 'module'];
  protected requirementOptions: IOption[] = [
    {label: 'Skip', value: 'skip'},
    {label: 'requirements.txt', value: 'text'},
    {label: 'Manual', value: 'manual'}
  ];

  codeFormGroup = this.formBuilder.group({
    name: [null, [Validators.required, Validators.minLength(3)]],
    repo: [null, Validators.required],
    type: ['branch'],
    branch: ['master', Validators.required],
    commit: [null],
    tag: [null],
    directory: ['.', Validators.required],
    scriptType: ['script'],
    script: [null, Validators.required],
    module: [null],
    existing: [false],
    taskInit: [true],
  });
  argsFormGroup = this.formBuilder.group({
    args: this.formBuilder.array([])
  })
  envFormGroup = this.formBuilder.group({
    poetry: [false],
    binary: [null],
    venv: [null],
    requirements: ['text'],
    pip: ['']
  });
  dockerFormGroup = this.formBuilder.group({
    image: [null],
    args: [''],
    script: ['']
  });
  queueFormGroup = this.formBuilder.group({
    queue: [null, Validators.required],
    output: ['']
  })

  protected queueVal = toSignal<string>(this.queueFormGroup.controls.queue.valueChanges);

  constructor() {
    this.store.dispatch(getQueuesForEnqueue());
  }

  get args() {
    return this.argsFormGroup.get('args') as FormArray;
  }

  addArg() {
    this.args.push(this.formBuilder.group({
      key: ['', Validators.required],
      value: [''],
    }))
  }

  removeArg(index: number) {
    this.args.removeAt(index);
  }

  checkDocker() {
    if (this.envFormGroup.controls.poetry.value ||
      this.envFormGroup.controls.venv.value || this.envFormGroup.controls.requirements.value === 'skip') {
      this.dockerFormGroup.controls.image.setValidators(Validators.required);
    } else {
      this.dockerFormGroup.controls.image.clearValidators();
    }
    this.dockerFormGroup.controls.image.updateValueAndValidity();
  }

  close(action: 'save' | 'run') {
    this.dialog.close({
      action,
      ...this.codeFormGroup.value,
      ...(this.codeFormGroup.controls.scriptType.value === 'module' && {script: `-m ${this.codeFormGroup.value.module}`}),
      ...this.argsFormGroup.value,
      ...this.envFormGroup.value,
      ...(this.envFormGroup.controls.requirements.value === 'manual' && {pip: this.envFormGroup.controls.pip.value}),
      docker: this.dockerFormGroup.value,
      ...this.queueFormGroup.value,
      ...(this.queueFormGroup.controls.queue.value ? {queue: this.queues()?.find(queue => queue.name === this.queueFormGroup.controls.queue.value)} : null),
    } as createExperimentDialogResult)
  }

  typeChange(value: string, types: string[]) {
    types.forEach(type => {
      if (type === value) {
        this.codeFormGroup.controls[type].setValidators(Validators.required);
      } else {
        this.codeFormGroup.controls[type].clearValidators();
        this.codeFormGroup.controls[type].updateValueAndValidity({onlySelf: true});
      }
      this.codeFormGroup.updateValueAndValidity();
    })
  }

  togglePoetry(usePoetry: boolean) {
    if (usePoetry) {
      Object.keys(this.envFormGroup.controls)
        .filter(name => name !== 'poetry')
        .map(name => this.envFormGroup.controls[name] as FormControl)
        .forEach((control) => control.disable());
    } else {
      Object.keys(this.envFormGroup.controls)
        .filter(name => name !== 'poetry')
        .map(name => this.envFormGroup.controls[name] as FormControl)
        .forEach((control) => control.enable());
    }
  }

  loadMoreQueues() {
    this.store.dispatch(getQueuesForEnqueue());
  }
}
