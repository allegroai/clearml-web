import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Project} from '../../../../../business-logic/model/projects/project';
import {Component, Inject, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {selectProjects} from '../../../../../webapp-common/core/reducers/projects.reducer';
import {GetAllProjects} from '../../../../../webapp-common/core/actions/projects.actions';
import {map, tap} from 'rxjs/operators';
import {IOption} from '../../../../../webapp-common/shared/ui-components/inputs/select-autocomplete/select-autocomplete.component';
import {isExample} from '../../../../../webapp-common/shared/utils/shared-utils';

@Component({
  selector: 'sm-change-project-dialog',
  templateUrl: './change-project-dialog.component.html',
  styleUrls: ['./change-project-dialog.component.scss']
})
export class ChangeProjectDialogComponent implements OnInit {

  public type: string;
  public projects$: Observable<Array<IOption>>;
  public selectedProjectId: Project['id'];
  public currentProject: string;
  public project: Project;
  private projects: Array<Project>;
  public reference: string;

  constructor(
    private store: Store<any>, public dialogRef: MatDialogRef<ChangeProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      currentProject: Project['id'];
      defaultProject: Project['id'];
      reference?: string;
      type?: string;
    }
  ) {
    this.selectedProjectId = data.defaultProject;
    this.currentProject = data.currentProject;
    this.reference = data.reference;
    this.type = data.type;
    this.projects$ = this.store.pipe(
      select(selectProjects),
      map(projects => projects.filter((project) => !isExample(project))),
      tap((projects) => {
        this.projects = projects;
        if (projects) {
          const project = this.projects.find(proj => proj.id === this.currentProject);
          window.setTimeout(() => this.project = project);
        }
      }),
      map(projects => projects.map(proj => ({value: proj.id, label: proj.name})))
    );
  }

  ngOnInit(): void {
    this.store.dispatch(new GetAllProjects());
  }

  projectChanged(event) {
    this.selectedProjectId = event.value;
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      this.dialogRef.close(this.projects.find(proj => proj.id === this.selectedProjectId));
    } else {
      this.dialogRef.close(null);
    }
  }
}
