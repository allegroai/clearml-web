import * as createNewProjectActions from './project-dialog.actions';
import {moveProject} from './project-dialog.actions';
import * as createProjectSelectors from './project-dialog.reducer';
import {CREATION_STATUS} from './project-dialog.reducer';

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ProjectsCreateRequest} from '../../../business-logic/model/projects/projectsCreateRequest';

@Component({
  selector: 'sm-project-create-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss']
})
export class ProjectDialogComponent implements OnInit, OnDestroy {
  public projects$: Observable<any>;
  private creationStatusSubscription: Subscription;
  public baseProjectId: string;
  public mode: string;
  public header: string;
  public modeParameters: { [mode: string]: { header: string; icon: string } } = {
    create: {
      header: 'NEW PROJECT',
      icon: 'al-color blue-300 al-ico-projects'
    },
    move: {
      header: 'MOVE TO',
      icon: 'al-color blue-300 al-ico-move-to'
    },

  };

  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<ProjectDialogComponent>, @Inject(MAT_DIALOG_DATA) data: { projectId: string, mode: string }) {
    this.baseProjectId = data.projectId;
    this.mode = data.mode;
    this.projects$ = this.store.select(createProjectSelectors.selectProjects);
  }

  ngOnInit(): void {
    this.store.dispatch(new createNewProjectActions.GetProjects());
    this.creationStatusSubscription = this.store.select(createProjectSelectors.selectCreationStatus).subscribe(status => {
      if (status === CREATION_STATUS.SUCCESS) {
        return this.matDialogRef.close(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new createNewProjectActions.ResetState());
    this.creationStatusSubscription.unsubscribe();
  }

  public createProject(projectForm) {
    const project = this.convertFormToProject(projectForm);
    this.store.dispatch(new createNewProjectActions.CreateNewProject(project));
  }

  moveProject(event) {
    if (event.location === 'Projects root') {
      event.location = '';
    }
    this.store.dispatch(moveProject({project: this.baseProjectId, new_location: event.location, name: event.name}));
  }

  private convertFormToProject(projectForm: any): ProjectsCreateRequest {
    return {
      name: `${projectForm.parent === 'Projects root' ? '' : projectForm.parent + '/'}${projectForm.name}`,
      description: projectForm.description,
      system_tags: projectForm.system_tags,
      default_output_destination: projectForm.default_output_destination
    };
  }


  closeDialog() {
    this.matDialogRef.close();
  }
}
