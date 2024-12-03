import {
  ChangeDetectionStrategy,
  Component, computed, effect,
  EventEmitter, inject, input,
  Output, signal,
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Project} from '~/business-logic/model/projects/project';
import {trackByValue} from '@common/shared/utils/forms-track-by';
import {rootProjectsPageSize} from '@common/constants';

export interface NewReportData {
  name: string;
  description: string;
  project: Project;
}

@Component({
  selector: 'sm-create-new-report-form',
  templateUrl: './create-new-report-form.component.html',
  styleUrls: ['./create-new-report-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNewReportFormComponent {
  private builder = inject(FormBuilder);

  public trackByValue = trackByValue;
  private createNew: string;
  public readonly projectsRoot = {name: 'Projects root', id: null};

  // public reportsNames: string[];
  protected reportForm = this.builder.group({
    name: [null as string, [Validators.required, Validators.minLength(3)]],
    description: '',
    project: [null as string, [Validators.required, Validators.minLength(3)]]
  });

  filterText = '';
  isAutoCompleteOpen: boolean;

  readOnlyProjectsNames = input<string[]>();
  defaultProjectId = input<string>();
  projects = input<Project[]>(null);

  @Output() filterSearchChanged = new EventEmitter<{value: string; loadMore?: boolean}>();
  @Output() reportCreated = new EventEmitter<NewReportData>();

  protected loading = signal(true);
  private initialized = false;
  protected noMoreOptions = computed(() => this.projects()?.length < rootProjectsPageSize);
  protected projectsOptions = computed(() => [
    ...((this.reportForm.controls.project.value && !this.projectsRoot.name.toLowerCase().includes(this.reportForm.controls.project.value.toLowerCase()) || this.projects() === null) ? [] : [this.projectsRoot]),
    ...(this.projects() ?? [])
  ]);
  protected projectsNames = computed(() => [this.projectsRoot.name, ...this.projectsOptions().map(project => project.name)]);


  constructor() {
    effect(() => {
      if (this.projects() !== null) {
        this.loading.set(false);
      }
    }, {allowSignalWrites: true});

    effect(() => {
      if (this.projects()?.length > 0 && !this.initialized) {
        this.initialized = true;
        this.reportForm.controls.project.setValue(this.projectsOptions().find(p => p.id === this.defaultProjectId())?.name || this.projectsRoot.name);
        this.reportForm.controls.project.updateValueAndValidity();
      }
    });

    effect(() => {
      this.searchChanged(['*', null].includes(this.defaultProjectId()) ? '' : this.defaultProjectId());
    });
  }

  createNewSelected($event: string) {
    this.createNew = $event;
  }

  send() {
    const project = this.reportForm.controls.project.value;
    this.reportCreated.emit({
      ...this.reportForm.value,
      project: project === this.createNew ? {name: project} : this.projectsOptions().find(p => p.name === project)
    } as NewReportData);
  }

  searchChanged(searchString: string) {
    if (searchString !== null) {
      this.filterSearchChanged.emit({value: searchString, loadMore: false});
    }
  }

  loadMore(term: string, loadMore: boolean) {
    this.loading.set(true);
    this.filterSearchChanged.emit({value: term || '', loadMore});
  }
}

