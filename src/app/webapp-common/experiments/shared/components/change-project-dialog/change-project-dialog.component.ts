import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {Project} from '~/business-logic/model/projects/project';
import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {asyncScheduler, Observable, Subscription} from 'rxjs';
import {selectRootProjects} from '@common/core/reducers/projects.reducer';
import {getAllSystemProjects} from '@common/core/actions/projects.actions';
import {filter, map, startWith} from 'rxjs/operators';
import {castArray, isEqual} from 'lodash-es';
import {NgForm} from '@angular/forms';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector: 'sm-change-project-dialog',
  templateUrl: './change-project-dialog.component.html',
  styleUrls: ['./change-project-dialog.component.scss']
})
export class ChangeProjectDialogComponent implements OnInit, OnDestroy {

  public projects$: Observable<Project[]>;
  public sourceProject: Project;
  public currentProjects: string[];
  public projects: { label: string; value: string }[];
  public filteredProjects: Observable<{ label: string; value: string }[]>;
  public formData: { project: any } = {
    project: null
  };
  public reference: string;
  private projectsSub: Subscription;
  filterText: string = '';
  isNewName: boolean = false;

  @ViewChild('moveToForm', {static: true}) moveToForm: NgForm;
  public readOnlyProjects$: Observable<string[]>;
  public isAutoCompleteOpen: boolean;
  public currentProjectInstance: Project;
  public isMulti: boolean;
  type: EntityTypeEnum;

  constructor(
    private store: Store<any>, public dialogRef: MatDialogRef<ChangeProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      currentProjects: Project['id'] | Project['id'][];
      defaultProject: Project;
      reference?: string | any[];
      type: EntityTypeEnum;
    }
  ) {
    this.sourceProject = data.defaultProject;
    this.currentProjects = castArray(data.currentProjects);
    this.isMulti = !!Array.isArray(data.reference);
    this.type = data.type;
    this.reference = Array.isArray(data.reference) ? `${data.reference.length} ${data.type}s` : data.reference;
    this.readOnlyProjects$ = this.store.select(selectRootProjects)
      .pipe(map(projects => projects.filter(project => isReadOnly(project)).map(project=> project.name).concat(this.currentProjectInstance?.name)));
    this.projects$ = this.store.select(selectRootProjects).pipe(
      filter(projects => !!projects),
      map(projects => projects.filter((project) => !isReadOnly(project)))
    );
  }

  ngOnInit(): void {
    this.store.dispatch(getAllSystemProjects());
    this.projectsSub = this.projects$.subscribe(projects => {
      if (this.currentProjects.length === 1) {
        this.currentProjectInstance = projects.find(proj => proj.id === this.currentProjects[0]);
      }
      const projectNameToHide = (this.sourceProject && !this.sourceProject.name.match(/^\.\w+$/)) ? this.sourceProject.name?.replace(/\/\.\w+$/, '') : 'Projects root';
      const sourceProjectOrChild = new RegExp(`^${projectNameToHide}(\/\.[a-zA-Z]+)*$`);
      const projectList = [{value: null, label: 'Projects root'}].concat(projects.map(project => ({value: project.id, label: project.name})))
          .filter( project => !project.label.match(sourceProjectOrChild) && project.value !== this.sourceProject?.id);
      if (!isEqual(projectList, this.projects)) {
        this.projects = projectList;
      }
    });
    setTimeout(() => {
      if (!this.moveToForm?.controls['projectName']) {
        return;
      }
      this.filteredProjects = this.moveToForm.controls['projectName'].valueChanges
        .pipe(
          map(value => typeof value === 'string' ? value : value.label),
          map(value => this._filter(value)),
          startWith(this.projects, asyncScheduler)
        );
    }, 1000);
  }

  ngOnDestroy(): void {
    this.projectsSub.unsubscribe();
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      if (typeof this.formData.project === 'string') {
        this.formData.project = {label: this.formData.project, value: ''};
      }
      this.dialogRef.close({id: this.formData.project.value, name: this.formData.project.value === null ? undefined : this.formData.project.label});
    } else {
      this.dialogRef.close(null);
    }
  }

  private _filter(value: string) {
    this.filterText = value;
    const projectsNames = this.projects.map(project => project.label);
    this.isNewName = !projectsNames.includes(value);
    const filterValue = value.toLowerCase();
    return this.projects.filter((project: any) => project.label.toLowerCase().includes(filterValue.toLowerCase()));
  }

  displayFn(project: any ): string {
    return project && project.label ? project.label : project ;
  }

  clear() {
    this.filterText = '';
    this.formData.project = '';
  }
  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  trackByFn = (index, project) => project.value;
}
