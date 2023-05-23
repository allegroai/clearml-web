import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {Project} from '~/business-logic/model/projects/project';
import {trackByValue} from '@common/shared/utils/forms-track-by';
import {MatOptionSelectionChange} from '@angular/material/core';
import {rootProjectsPageSize} from '@common/constants';


@Component({
  selector: 'sm-create-new-report-form',
  templateUrl: './create-new-report-form.component.html',
  styleUrls: ['./create-new-report-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNewReportFormComponent implements OnChanges, OnInit, OnDestroy {
  public filteredProjects$: Observable<{ label: string; value: string }[]>;
  private _projects: Project[];
  public projectsOptions: { label: string; value: string }[];
  public trackByValue = trackByValue;
  public panelHeight: number;
  private subs = new Subscription();
  private rootFiltered: boolean;
  public readonly projectsRoot = {label: 'Projects root', value: null};
  @ViewChild('projectInput') projectInput: NgModel;

  public reportsNames: Array<string>;
  public projectsNames: Array<string>;
  public report: { name: string; description: string; project: { label: string; value: string } } = {
    name: null,
    description: '',
    project: null
  };
  filterText: string = '';
  isAutoCompleteOpen: boolean;

  @Input() readOnlyProjectsNames: string[];
  @Input() defaultProjectId: string;
  public loading: boolean;
  public noMoreOptions: boolean;
  private previousLength: number | undefined;

  @Input() set projects(projects: Project[]) {
    this.loading = false;
    this.noMoreOptions = projects?.length === this.previousLength || projects?.length < rootProjectsPageSize;
    this.previousLength = projects?.length;
    this._projects = projects;
    this.projectsOptions = [
      ...(this.rootFiltered || !projects ? [] : [this.projectsRoot]),
      ...(projects ? projects.map(project => ({label: project.name, value: project.id})) : [])
    ];
    this.projectsNames = this.projectsOptions.map(project => project.label);
  }

  get projects() {
    return this._projects;
  }

  @Output() filterSearchChanged = new EventEmitter<{value: string; loadMore?: boolean}>();
  @Output() reportCreated = new EventEmitter();

  ngOnInit(): void {
    this.searchChanged(['*', null].includes(this.defaultProjectId) ? '' : this.defaultProjectId);
    setTimeout(() => {
      this.subs.add(this.projectInput.valueChanges.subscribe(searchString => {
          if (searchString !== this.report.project) {
            this.searchChanged(searchString?.label || searchString || '');
          }
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(): void {
    if (this.projects?.length > 0 && this.report.project === null) {
      this.report.project = this.projectsOptions.find(p => p.value === this.defaultProjectId) || {label: this.projectsRoot.label, value: null};
      this.projectInput.control.updateValueAndValidity();
    }
  }

  createNewSelected($event: MatOptionSelectionChange<any>) {
    this.report.project = {label: $event.source.value, value: null};
  }

  projectSelected($event: MatOptionSelectionChange<any>) {
    this.report.project = {label: $event.source.value.label, value: $event.source.value.value};
  }
  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  displayFn(project: any): string {
    return project && project.label ? project.label : project;
  }

  clear() {
    this.projectInput.control.setValue('');
  }

  send() {
    this.reportCreated.emit(this.report);
  }

  searchChanged(searchString: string) {
    this.projectsOptions = null;
    this.projectsNames = null;
    this.rootFiltered = !this.projectsRoot.label.includes(searchString);
    searchString !== null && this.filterSearchChanged.emit({value: searchString, loadMore: false});
  }

  loadMore(searchString) {
    this.loading = true;
    this.filterSearchChanged.emit({value: searchString || '', loadMore: true});
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }
}

