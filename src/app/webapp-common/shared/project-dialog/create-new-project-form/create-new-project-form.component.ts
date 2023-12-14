import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {URI_REGEX} from '~/app.constants';
import {Project} from '~/business-logic/model/projects/project';
import {NgForm} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {Subscription} from 'rxjs';
import {rootProjectsPageSize} from '@common/constants';


@Component({
  selector: 'sm-create-new-project-form',
  templateUrl: './create-new-project-form.component.html',
  styleUrls: ['./create-new-project-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNewProjectFormComponent implements OnChanges, OnInit, OnDestroy {
  public rootFiltered: boolean;
  public readonly projectsRoot = 'Projects root';
  public projectsNames: Array<string> = null;
  public outputDestPattern = `${URI_REGEX.S3_WITH_BUCKET}$|${URI_REGEX.S3_WITH_BUCKET_AND_HOST}$|${URI_REGEX.FILE}$|${URI_REGEX.NON_AWS_S3}$|${URI_REGEX.GS_WITH_BUCKET}$|${URI_REGEX.GS_WITH_BUCKET_AND_HOST}$`;
  public project = {
    name: '',
    description: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    default_output_destination: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    system_tags: [],
    parent: null
  };
  private _projects: Project[];
  private subs = new Subscription();
  public loading: boolean;
  public noMoreOptions: boolean;
  private inititated: boolean;
  private previousLength: number | undefined;


  @Input() set projects(projects) {
    this.loading = false;
    this.noMoreOptions = projects?.length === this.previousLength || projects?.length < rootProjectsPageSize;
    this.previousLength = projects?.length;
    this._projects = projects;
    if (!projects) {
      return;
    }
    // this.projectsNames = this.rootFiltered ? projects.map(project => project.name) : [this.projectsRoot].concat(projects.map(project => project.name));
    this.projectsNames = [
      ...(this.rootFiltered ? []: [this.projectsRoot]),
      ...(this.baseProject && !this.project.parent ? [this.baseProject.name] : []),
      ...projects.map(project => project.name)
    ];
  }

  get projects(): Project[] {
    return this._projects;
  }

  @Input() baseProject: Project;

  @Output() filterSearchChanged = new EventEmitter<{value: string; loadMore?: boolean}>();
  @Output() projectCreated = new EventEmitter();
  @ViewChild('projectForm') public form: NgForm;
  isAutoCompleteOpen: boolean;

  send() {
    if (this.project.default_output_destination === '') {
      this.project.default_output_destination = null;
    }
    this.projectCreated.emit(this.project);
  }


  ngOnChanges(): void {
    if (this.projects?.length > 0 && this.project.parent === null && !this.inititated) {
      this.project.parent = this.baseProject?.name ?? this.projectsRoot;
      this.inititated = true;
    }
  }

    clearLocation() {
    this.project.parent = '';
  }


  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  locationSelected($event: MatAutocompleteSelectedEvent) {
    this.project.parent = $event.option.value;
  }

  searchChanged(searchString: any) {
    this.projectsNames = null;
    this.rootFiltered = !this.projectsRoot.includes(searchString) && this.projectsRoot === this.baseProject?.name;
    searchString !== null && this.filterSearchChanged.emit({value: searchString});
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.subs.add(this.form.controls['location'].valueChanges.subscribe(searchString => {
          if (searchString !== this.project.parent) {
            this.searchChanged(searchString || '');
          }
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadMore(searchString) {
    this.loading = true;
    this.filterSearchChanged.emit({value: searchString || '', loadMore: true});
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }
}

