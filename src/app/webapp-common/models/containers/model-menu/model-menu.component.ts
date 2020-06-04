import {Input, Output, EventEmitter, ElementRef, Component} from '@angular/core';
import * as menuActions from '../../actions/models-menu.actions';
import {ChangeProjectRequested, PublishModelClicked} from '../../actions/models-menu.actions';
import {isExample, htmlTextShorte} from '../../../shared/utils/shared-utils';
import {ICONS} from '../../../../app.constants';
import { MatDialog } from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {AdminService} from '../../../../features/admin/admin.service';
import {selectS3BucketCredentials} from '../../../core/reducers/common-auth-reducer';
import {IModelInfoState} from '../../reducers/model-info.reducer';
import {get} from 'lodash/fp';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {Observable, Subscription} from 'rxjs';
import {filter, first, skip} from 'rxjs/operators';
import {ChangeProjectDialogComponent} from '../../../experiments/shared/components/change-project-dialog/change-project-dialog.component';
import {resetDontShowAgainForBucketEndpoint} from '../../../core/actions/common-auth.actions';
import {BaseContextMenuComponent} from '../../../shared/components/base-context-menu/base-context-menu.component';


@Component({
  selector: 'sm-base-model-menu',
  template: ''
})
export class BaseModelMenuComponent extends BaseContextMenuComponent {

  readonly ICONS = ICONS;
  private S3BucketCredentialsSubscription: Subscription;
  private S3BucketCredentials: Observable<any>;
  public modelSignedUri: string;
  public _model: any;
  public isExample: boolean;

  @Input() set model(model) {
    this._model = model;
    this.isExample = isExample(model);
  }

  get model() {
    return this._model;
  }

  @Input() selectedModel;
  @Input() numSelected = 0;
  @Input() allTags: string[];
  @Input() showButton = true;
  @Output() tagSelected = new EventEmitter<string>();

  constructor(
    protected dialog: MatDialog,
    protected store: Store<IModelInfoState>,
    protected adminService: AdminService,
    protected eRef: ElementRef
  ) {
    super(store, eRef);
    this.S3BucketCredentials = store.select(selectS3BucketCredentials);
  }

  restoreArchivePopup() {
    const isArchived = this.model.system_tags && this.model.system_tags.includes('archived');
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: isArchived ? 'Restore models' : 'Archive models',
        body: `<b>${htmlTextShorte(this.model.name)}</b> will be ${
          isArchived ? 'restored. It will be visible using "Exit Archive"'
            : 'archived. It will be visible using "Open Archive"'
        }.`,
        yes: isArchived ? 'Restore from archive' : 'Archive',
        no: 'keep',
        iconClass: 'i-archive',
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.archiveClicked();
      }
    });
  }

  archiveClicked() {
    const payload = {model: this.model, selectedModel: this.selectedModel};
    if (this.model.system_tags && this.model.system_tags.includes('archived')) {
      this.store.dispatch(new menuActions.RestoreClicked(payload));
    } else {
      this.store.dispatch(new menuActions.ArchiveClicked(payload));
    }
  }

  private refreshDownload() {
    if (this.S3BucketCredentialsSubscription) {
      this.S3BucketCredentialsSubscription.unsubscribe();
    }
    this.S3BucketCredentialsSubscription = this.S3BucketCredentials.pipe(
      skip(1),
      first()
    ).subscribe(() => {
      this.downloadModelFile();
    });
  }

  public publishPopup() {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'PUBLISH',
        body: `<b>${htmlTextShorte(this.model.name)}</b> status will be set to Published.
<br><br>Published models are read-only and cannot be reset.`,
        yes: 'Publish',
        no: 'Cancel',
        iconClass: 'd-block fas fa-cloud-upload-alt fa-7x w-auto',
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.publishModel();
      }
    });
  }

  publishModel() {
    this.store.dispatch(new PublishModelClicked(this.model));
  }

  public moveToProjectPopup() {
    const dialog = this.dialog.open(ChangeProjectDialogComponent, {
      data: {
        currentProject: get('project.id', this.model),
        defaultProject: get('project.id', this.model),
        reference: this.model.name,
        type: 'model' }
    });
    dialog.afterClosed().pipe(filter(project => !!project)).subscribe(project => {
      this.moveToProjectClicked(project);
    });
  }

  moveToProjectClicked(project) {
    this.store.dispatch(new ChangeProjectRequested({model: this.model, project}));
  }

  public downloadModelFileClicked = () => {
    this.store.dispatch(resetDontShowAgainForBucketEndpoint());
    this.modelSignedUri = this.adminService.signUrlIfNeeded(this.model.uri, true);
    if (this.modelSignedUri) {
      this.downloadModelFile();
    } else {
      this.refreshDownload();
    }
  };

  public downloadModelFile = () => {
    const a = document.createElement('a') as HTMLAnchorElement;
    a.target = '_blank';
    a.href = this.modelSignedUri;
    a.click();
  };

  public canShowModel() {
    return !!this.model && !'Custom'.includes(this.model.framework);
  }
}
