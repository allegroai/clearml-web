import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  Output,
} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {UniqueProjectValidator} from '@common/shared/project-dialog/unique-project.validator';
import {OutputDestPattern} from '@common/shared/project-dialog/project-dialog.component';
import {ProjectLocationPipe} from '@common/shared/pipes/project-location.pipe';
import {MatButton} from '@angular/material/button';


@Component({
  selector: 'sm-edit-project-form',
  templateUrl: './edit-project-form.component.html',
  styleUrls: ['./edit-project-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatInputModule,
    MatProgressSpinnerModule,
    UniqueProjectValidator,
    ReactiveFormsModule,
    MatButton,
  ]
})
export class EditProjectFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  public readonly projectsRoot = 'Projects root';

  projectForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    parent: [null as string,[]],
    default_output_destination: [null as string,[Validators.pattern(OutputDestPattern)]],
    system_tags: [[]]
  });

  public loading: boolean;
  public noMoreOptions: boolean;



  project = input<Project>();
  parentProjectPath = computed(() => {
    return new ProjectLocationPipe().transform(this.project()?.name)
  });

  @Output() projectUpdated = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();


  constructor() {
    effect(() => {
      this.projectForm.controls.name.setValue(this.project()?.basename ?? '');
      this.projectForm.controls.parent.setValue(this.parentProjectPath());
      this.projectForm.controls.default_output_destination.setValue(this.project()?.default_output_destination);
      this.projectForm.controls.parent.disable();
    });
  }

  send() {
    this.projectUpdated.emit({
      ...this.projectForm.getRawValue(),
      ...(this.projectForm.controls.default_output_destination.value === '' && {default_output_destination: null})
    });
  }
}

