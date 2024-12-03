import {
  ChangeDetectionStrategy,
  Component, computed, effect,
  EventEmitter, inject,
  input,
  Output,
} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {rootProjectsPageSize} from '@common/constants';
import {MatInputModule} from '@angular/material/input';
import {StringIncludedInArrayPipe} from '@common/shared/pipes/string-included-in-array.pipe';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {UniqueNameValidatorDirective} from '@common/shared/ui-components/template-forms-ui/unique-name-validator.directive';
import {UniqueProjectValidator} from '@common/shared/project-dialog/unique-project.validator';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {
  PaginatedEntitySelectorComponent
} from '@common/shared/components/paginated-entity-selector/paginated-entity-selector.component';
import {toSignal} from '@angular/core/rxjs-interop';
import {OutputDestPattern} from '@common/shared/project-dialog/project-dialog.component';


@Component({
  selector: 'sm-create-new-project-form',
  templateUrl: './create-new-project-form.component.html',
  styleUrls: ['./create-new-project-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatInputModule,
    StringIncludedInArrayPipe,
    ClickStopPropagationDirective,
    TooltipDirective,
    SearchTextDirective,
    MatProgressSpinnerModule,
    ScrollEndDirective,
    UniqueNameValidatorDirective,
    UniqueProjectValidator,
    ShowTooltipIfEllipsisDirective,
    LabeledFormFieldDirective,
    PaginatedEntitySelectorComponent,
    ReactiveFormsModule,
  ]
})
export class CreateNewProjectFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  public readonly projectsRoot = 'Projects root';

  projectForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],

    default_output_destination: [null, [Validators.pattern(OutputDestPattern)]],

    system_tags: [[]],
    parent: [null as string, [Validators.required, Validators.minLength(3)]]
  });

  public loading: boolean;
  public noMoreOptions: boolean;
  private initiated: boolean;
  private previousLength: number | undefined;


  baseProject = input<Project>();
  private projectValue = toSignal(this.projectForm.controls.parent.valueChanges);
  projects = input<Project[]>();
  protected rootFiltered = computed(() => !this.projectsRoot.includes(this.projectValue()) && this.projectsRoot === this.baseProject()?.name);
  protected allProjects = computed(() => ([
    ...(!this.projects() || this.rootFiltered() || this.baseProject()?.id === null ? [] : [{name: this.projectsRoot, id: '999999999999999'}]),
    ...(this.baseProject() && !this.projectForm.controls.parent.value ? [this.baseProject()] : []),
    ...this.projects() ?? []
  ]));
  protected projectsNames = computed(() => (this.allProjects().map(project => project.name)));

  @Output() filterSearchChanged = new EventEmitter<{value: string; loadMore?: boolean}>();
  @Output() projectCreated = new EventEmitter();


  constructor() {
    effect(() => {
      const projectsCount = this.projects()?.length;
      this.loading = false;
      this.noMoreOptions = projectsCount === this.previousLength || projectsCount < rootProjectsPageSize;
      this.previousLength = projectsCount;

      if (projectsCount > 0 && this.projectForm.controls.parent.value === null && !this.initiated) {
        this.projectForm.controls.parent.patchValue(this.baseProject()?.name ?? this.projectsRoot);
        this.initiated = true;
      }
    });
  }

  send() {
    this.projectCreated.emit({
      ...this.projectForm.value,
      ...(this.projectForm.controls.default_output_destination.value === '' && {default_output_destination: null})
    });
  }

  loadMore(searchString: string, loadMore: boolean) {
    this.loading = true;
    const value = (searchString !== this.projectsRoot ? searchString : '') ?? '';
    this.filterSearchChanged.emit({value, loadMore});
  }
}

