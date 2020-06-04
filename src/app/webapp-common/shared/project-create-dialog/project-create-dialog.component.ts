import * as createNewProjectActions from './project-create-dialog.actions';
import * as createProjectSelectors from './project-create-dialog.reducer';

import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {CREATION_STATUS} from './project-create-dialog.reducer';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector   : 'sm-project-create-dialog',
  templateUrl: './project-create-dialog.component.html',
  styleUrls  : ['./project-create-dialog.component.scss']
})
export class ProjectCreateDialogComponent implements OnInit, OnDestroy {
  public projects$: Observable<any>;
  private creationStatusSubscription: Subscription;

  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<ProjectCreateDialogComponent>) {
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

  public createProject(project) {
    this.store.dispatch(new createNewProjectActions.CreateNewProject(project));
  }

}
