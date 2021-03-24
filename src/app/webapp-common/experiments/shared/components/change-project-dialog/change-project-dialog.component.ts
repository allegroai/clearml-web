import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from '../../../../../business-logic/model/projects/project';
import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {asyncScheduler, Observable, Subscription} from 'rxjs';
import {selectProjects} from '../../../../core/reducers/projects.reducer';
import {GetAllProjects} from '../../../../core/actions/projects.actions';
import {map, startWith} from 'rxjs/operators';
import {isReadOnly} from '../../../../shared/utils/shared-utils';
import {isEqual} from 'lodash/fp';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'sm-change-project-dialog',
  templateUrl: './change-project-dialog.component.html',
  styleUrls: ['./change-project-dialog.component.scss']
})
export class ChangeProjectDialogComponent implements OnInit {

  public projects$: Observable<Project[]>;
  public selectedProjectId: Project['id'];
  public currentProject: string;
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

  constructor(
    private store: Store<any>, public dialogRef: MatDialogRef<ChangeProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      currentProject: Project['id'];
      defaultProject: Project['id'];
      reference?: string;
    }
  ) {
    this.selectedProjectId = data.defaultProject;
    this.currentProject = data.currentProject;
    this.reference = data.reference;
    this.readOnlyProjects$ = this.store.select(selectProjects)
      .pipe(map(projects => projects.filter(project => isReadOnly(project)).map(project=> project.name).concat(this.currentProjectInstance.name)));
    this.projects$ = this.store.select(selectProjects).pipe(
      map(projects => projects.filter((project) => !isReadOnly(project)))
    );
  }

  ngOnInit(): void {
    this.store.dispatch(new GetAllProjects());
    this.projectsSub = this.projects$.subscribe(projects => {
      this.currentProjectInstance = projects.find(proj => proj.id === this.currentProject);
      const projectList = projects.map(project => ({value: project.id, label: project.name}));
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
      this.dialogRef.close({id: this.formData.project.value, name: this.formData.project.label});
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
}
