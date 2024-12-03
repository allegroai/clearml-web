import * as createNewProjectActions from './project-dialog.actions';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {ProjectsCreateRequest} from '~/business-logic/model/projects/projectsCreateRequest';
import {selectTablesFilterProjectsOptions} from '@common/core/reducers/projects.reducer';
import {getTablesFilterProjectsOptions, resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {Project} from '~/business-logic/model/projects/project';
import {URI_REGEX} from '~/app.constants';

export interface ProjectDialogConfig {
  project: Project;
  mode: string;
}
export const OutputDestPattern = `${URI_REGEX.S3_WITH_BUCKET}$|${URI_REGEX.S3_WITH_BUCKET_AND_HOST}$|${URI_REGEX.FILE}$|${URI_REGEX.NON_AWS_S3}$|${URI_REGEX.GS_WITH_BUCKET}$|${URI_REGEX.GS_WITH_BUCKET_AND_HOST}|${URI_REGEX.AZURE_WITH_BUCKET}`;



@Component({
  selector: 'sm-project-create-dialog',
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss']
})
export class ProjectDialogComponent implements OnInit, OnDestroy {
  public projects$: Observable<any>;
  public baseProject: Project;
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
    edit: {
      header: 'EDIT PROJECT',
      icon: 'al-color blue-300 al-ico-projects'
    },

  };

  constructor(
    private store: Store,
    private matDialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ProjectDialogConfig
  ) {

    this.baseProject = data.project;
    this.mode = data.mode;
    this.projects$ = this.store.select(selectTablesFilterProjectsOptions);
  }

  ngOnInit(): void {
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: '', loadMore: false}));
  }

  ngOnDestroy(): void {
    this.store.dispatch(createNewProjectActions.resetState());
  }

  public createProject(projectForm) {
    const project = this.convertFormToProject(projectForm);
    this.store.dispatch(createNewProjectActions.createNewProject({req: project, dialogId: this.matDialogRef.id}));
  }
  public updateProject(projectForm) {
    const project = {project: this.baseProject.id, ...this.convertFormToProject(projectForm)};
    this.store.dispatch(createNewProjectActions.updateProject({req: project, dialogId: this.matDialogRef.id}));
  }

  moveProject(event: {location: string; name: string; fromName: string; toName: string; projectName: string}) {
    this.store.dispatch(createNewProjectActions.moveProject({
      project: this.baseProject.id,
      ...event,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      new_location: event.location === 'Projects root' ? '' : event.location,
      dialogId: this.matDialogRef.id
    }));
  }

  private convertFormToProject(projectForm: any): ProjectsCreateRequest {
    return {
      name: `${projectForm.parent === 'Projects root' ? '' : projectForm.parent + '/'}${projectForm.name}`,
      ...(projectForm.description && {description: projectForm.description}),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ...(projectForm.system_tags && {system_tags: projectForm.system_tags}),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      default_output_destination: projectForm.default_output_destination
    };
  }

  filterSearchChanged($event: {value: string; loadMore?: boolean}) {
    !$event.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: $event.value || '', loadMore: $event.loadMore,  allowPublic: false}));
  }

  closeDialog() {
    this.matDialogRef.close();
  }
}
