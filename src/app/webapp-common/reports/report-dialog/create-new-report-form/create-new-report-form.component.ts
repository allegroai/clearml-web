import {
  AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import {NgModel} from '@angular/forms';
import {debounceTime, distinctUntilChanged, map, startWith, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { Project } from '~/business-logic/model/projects/project';
import {trackByValue} from '@common/shared/utils/forms-track-by';


@Component({
  selector: 'sm-create-new-report-form',
  templateUrl: './create-new-report-form.component.html',
  styleUrls: ['./create-new-report-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNewReportFormComponent implements OnChanges, AfterViewInit{
  public filteredProjects$: Observable<{ label: string; value: string }[]>;
  private _projects: Project[];
  public projectsOptions: { label: string; value: string }[];
  public trackByValue = trackByValue;
  public panelHeight: number;
  constructor(private changeDetection: ChangeDetectorRef) {
  }
  public readonly projectsRoot = {label: 'Projects root', value: null};
  @ViewChild('projectInput') projectInput: NgModel;

  public reportsNames: Array<string>;
  public projectsNames: Array<string>;
  public report: {name: string; description: string; project: {label: string; value: string}} = {
    name: '',
    description: '',
    project: undefined
  };
  filterText: string = '';
  // isNewName: boolean = false;



  @Input() set projects(projects: Project[]) {
    this._projects = projects;
    this.projectsOptions  =  [this.projectsRoot].concat(projects?.map(project=> ({label:project.name, value: project.id})) ?? []);
    this.projectsNames = [this.projectsRoot.label].concat(projects?.map(project => project.name));
  }

  get projects() {
    return this._projects;
  }
  @Input() readOnlyProjectsNames: string[];


  @Output() reportCreated = new EventEmitter();
  isAutoCompleteOpen: boolean;

  send() {
    this.reportCreated.emit(this.report);
  }


  ngOnChanges(): void {
    if (this.projects?.length > 0) {
      this.report.project =  {label:this.projectsRoot.label, value: null};
    }
  }

  detectChanges() {
    this.changeDetection.detectChanges();
  }

  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  displayFn(project: any ): string {
    return project && project.label ? project.label : project ;
  }

  clear() {
    this.filterText = '';
    this.report.project = undefined;
    this.projectInput.control.setValue('');
  }
  private _filter(value: string) {
    this.filterText = value;
    // const projectsNames = this.projectsOptions.map(project => project.label);
    // this.isNewName = !projectsNames.includes(value);
    const filterValue = value.toLowerCase();
    return this.projectsOptions.filter((project: any) => project.label.toLowerCase().includes(filterValue));
  }

  ngAfterViewInit() {
    this.filteredProjects$ = this.projectInput.control.valueChanges
      .pipe(
        debounceTime(200),
        map(value => typeof value === 'string' ? value : value?.label as string),
        distinctUntilChanged(),
        map(value => !!value ? this._filter(value) : this.projectsOptions),
        tap(projects => this.panelHeight = Math.min(projects?.length || 0, 6) * 38),
        startWith(this.projectsOptions)
      );
  }
}

