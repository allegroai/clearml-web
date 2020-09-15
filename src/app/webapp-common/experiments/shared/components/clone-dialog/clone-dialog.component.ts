import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from '../../../../../business-logic/model/projects/project';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {selectProjects} from '../../../../core/reducers/projects.reducer';
import {GetAllProjects} from '../../../../core/actions/projects.actions';
import {map} from 'rxjs/operators';
import {isExample} from '../../../../shared/utils/shared-utils';
import {CloneForm} from '../../common-experiment-model.model';

@Component({
  selector   : 'sm-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls  : ['./clone-dialog.component.scss']
})
export class CloneDialogComponent implements OnInit, OnDestroy {

  CLONE_NAME_PREFIX = 'Clone Of ';
  public reference: string;
  public header: string;
  public type: string;
  public projects$: Observable<Project[]>;
  public formData = <CloneForm>{
    project: null,
    name   : null,
    comment: null
  };

  public errors = {
    name: null,
  };

  public errorMessages = {
    name: {
      required: 'Please provide a name'
    }
  };

  validators = {
    name: [Validators.required]
  };
  private readonly defaultProjectId: string;
  private projectsSub: Subscription;
  public projects: { label: string; value: string }[];

  constructor(private store: Store<any>, @Inject(MAT_DIALOG_DATA) data: {
                type: string;
                defaultProject: Project['id'];
                defaultName: string;
                defaultComment: string;
              }, public dialogRef: MatDialogRef<CloneDialogComponent>
  ) {
    this.projects$ = this.store.select(selectProjects).pipe(map(projects => projects.filter( project => !isExample(project))));
    this.defaultProjectId = data.defaultProject;
    this.header = `Clone ${data.type}`;
    this.type = data.type.toLowerCase();
    this.reference = data.defaultName;
    this.formData.name = this.CLONE_NAME_PREFIX + data.defaultName;
    this.formData.comment = data.defaultComment || '';
  }

  ngOnDestroy(): void {
    this.projectsSub.unsubscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetAllProjects());
    this.projectsSub = this.projects$.subscribe(projects => {
      this.projects = projects.map(project => ({value: project.id, label: project.name}));
      const defaultProject = this.projects.find(project => project.value === this.defaultProjectId);
      this.formData.project = defaultProject ? defaultProject.value : projects[0] ? this.projects[0].value : null;
    });
  }

  formDataChanged(event: { field: string, value: any }) {
    this.formData = {...this.formData, [event.field]: event.value};
  }

  formErrorChanged(event: { field: string, errors: any }) {
    this.errors = {...this.errors, [event.field]: event.errors};
  }

  isFormValid() {
    return Object.values(this.errors).filter(err => {
      return !!err;
    }).length === 0;
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      this.dialogRef.close(this.formData);
    } else {
      this.dialogRef.close(null);
    }
  }

}
