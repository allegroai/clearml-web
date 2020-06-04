import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Project} from '../../../../../business-logic/model/projects/project';
import {Component, Inject, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {selectProjects} from '../../../../core/reducers/projects.reducer';
import {GetAllProjects} from '../../../../core/actions/projects.actions';
import {map, tap} from 'rxjs/operators';
import {isExample} from '../../../../../webapp-common/shared/utils/shared-utils';
import {CloneForm} from '../../common-experiment-model.model';

@Component({
  selector: 'sm-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss']
})
export class CloneDialogComponent implements OnInit {

  CLONE_NAME_PREFIX = 'Clone Of ';
  public reference: string;
  public header: string;
  public type: string;
  public projects$: Observable<Array<any>>;
  public formData = <CloneForm>{
    project: null,
    name: null,
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

  constructor(private store: Store<any>, @Inject(MAT_DIALOG_DATA) data: {
    type: string;
    defaultProject: Project['id'];
    defaultName: string;
    defaultComment: string; }, public dialogRef: MatDialogRef<CloneDialogComponent>
  ) {
    this.projects$ = this.store.pipe(
      select(selectProjects),
      map(projects => projects.filter((project) => !isExample(project))),
      tap(filteredProjects => {
        const defaultProject = filteredProjects.find(project => project.id === data.defaultProject);
        this.formData.project = defaultProject ? defaultProject.id : filteredProjects[0] ? filteredProjects[0].id : null;
        this.formData.comment = data.defaultComment || '';
      }),
      map(projects => projects.map(proj => ({value: proj.id, label: proj.name})))
    );
    this.header = `Clone ${data.type}`;
    this.type = data.type.toLowerCase();
    this.reference = data.defaultName;
    this.formData.name = this.CLONE_NAME_PREFIX + data.defaultName;
  }

  ngOnInit(): void {
    this.store.dispatch(new GetAllProjects());
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
