import * as createNewProjectActions from './project-dialog.actions';
import {moveProject} from './project-dialog.actions';
import * as createProjectSelectors from './project-dialog.reducer';
import {CREATION_STATUS} from './project-dialog.reducer';

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ProjectsCreateRequest} from '~/business-logic/model/projects/projectsCreateRequest';
import {selectRootProjects} from '@common/core/reducers/projects.reducer';
import {getAllSystemProjects} from '@common/core/actions/projects.actions';

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

  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<ProjectDialogComponent>, @Inject(MAT_DIALOG_DATA) data: { projectId: string; mode: string }) {
    this.baseProjectId = data.projectId;
    this.mode = data.mode;
    this.projects$ = this.store.select(selectRootProjects);
  }

  ngOnInit(): void {
    this.store.dispatch(getAllSystemProjects());
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

  moveProject(event: {location: string; name: string; fromName: string; toName: string; projectName: string}) {
    this.store.dispatch(moveProject({
      project: this.baseProjectId,
      ...event,
      new_location: event.location === 'Projects root' ? '' : event.location,
    }));
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
