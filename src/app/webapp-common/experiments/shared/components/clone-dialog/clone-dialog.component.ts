import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from '../../../../../business-logic/model/projects/project';
import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {NgForm} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {selectRootProjects} from '../../../../core/reducers/projects.reducer';
import {GetAllSystemProjects} from '../../../../core/actions/projects.actions';
import {map} from 'rxjs/operators';
import {isReadOnly} from '../../../../shared/utils/shared-utils';
import {CloneForm} from '../../common-experiment-model.model';
import {isEqual} from 'lodash/fp';

@Component({
  selector: 'sm-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss']
})
export class CloneDialogComponent implements OnInit, OnDestroy {

  CLONE_NAME_PREFIX;
  public reference: string;
  public header: string;
  public type: string;
  public projects$: Observable<Project[]>;
  public formData = {
    project: null,
    name: null,
    comment: null
  } as CloneForm;

  private readonly defaultProjectId: string;
  private projectsSub: Subscription;
  public projects: { label: string; value: string }[];

  @ViewChild('cloneForm', {static: true}) cloneForm: NgForm;
  @ViewChild('cloneButton', {static: true}) cloneButton: ElementRef;
  public filteredProjects: Observable<{ label: string; value: string }[]>;
  filterText: string = '';
  isNewName: boolean = false;
  isAutoCompleteOpen: boolean;
  public readOnlyProjects$: Observable<string[]>;
  public extend: boolean;

  constructor(
    private store: Store<any>,
    @Inject(MAT_DIALOG_DATA) data: {
      type: string;
      defaultProject: string;
      defaultName: string;
      defaultComment: string;
      extend: boolean;
    },
    public dialogRef: MatDialogRef<CloneDialogComponent>
  ) {
    this.readOnlyProjects$ = this.store.select(selectRootProjects)
      .pipe(map(projects => projects.filter(project => isReadOnly(project)).map(project => project.name)));
    this.projects$ = this.store.select(selectRootProjects)
      .pipe(map(projects => projects.filter(project => !isReadOnly(project))));
    this.defaultProjectId = data.defaultProject;
    this.header = `${data.extend ? 'Extend' : 'Clone'} ${data.type}`;
    this.CLONE_NAME_PREFIX = data.extend ? '' : 'Clone Of ';
    this.type = data.type.toLowerCase();
    this.reference = data.defaultName;
    this.extend = data.extend;
    this.formData.name = this.CLONE_NAME_PREFIX;
    setTimeout(() => {
      this.formData = {
        ...this.formData,
        name: this.extend ? '' : this.CLONE_NAME_PREFIX + data.defaultName,
        comment: data.defaultComment || '',
      };
    });
  }


  ngOnDestroy(): void {
    this.projectsSub.unsubscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetAllSystemProjects());
    this.projectsSub = this.projects$.subscribe(projects => {
      const projectList = projects.map(project => ({value: project.id, label: project.name}));
      if (!isEqual(projectList, this.projects)) {
        this.projects = projectList;
        const defaultProject = this.projects.find(project => project.value === this.defaultProjectId);
        setTimeout(() => {
          this.formData.project = defaultProject ? defaultProject : projects[0] ? this.projects[0] : null;
          this.filterText = this.formData.project?.label;
        }, 0);
      }
    });
    setTimeout(() => {
      if (!this.cloneForm?.controls['projectName']) {
        return;
      }
      this.filteredProjects = this.cloneForm.controls['projectName'].valueChanges
        .pipe(
          map(value => typeof value === 'string' ? value : value.label),
          map(value => this._filter(value))
        );
    }, 1000);

  }

  displayFn(project: any ): string {
    return project && project.label ? project.label : project ;
  }

  private _filter(value: string) {
    this.filterText = value;
    const projectsNames = this.projects.map(project => project.label);
    this.isNewName = !projectsNames.includes(value);
    const filterValue = value.toLowerCase();
    return this.projects.filter((project: any) => project.label.toLowerCase().includes(filterValue.toLowerCase()));
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      if (typeof this.formData.project === 'string') {
        this.formData.project = {label: this.formData.project, value: ''};
      }
      this.dialogRef.close(this.formData);
    } else {
      this.dialogRef.close(null);
    }
  }

  clear() {
    this.filterText = '';
    this.formData.project = '';
  }

  clearOnFirstFocus($event: FocusEvent) {
    if (this.cloneForm.controls['projectName'].untouched) {
      this.clear();
    }
  }

  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }
}
