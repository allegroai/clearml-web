import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  archivedSelectedModels,
  changeProjectRequested,
  publishModelClicked,
  restoreSelectedModels
} from '../../actions/models-menu.actions';
import {htmlTextShorte, isReadOnly} from '@common/shared/utils/shared-utils';
import {ICONS} from '@common/constants';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {AdminService} from '~/shared/services/admin.service';
import {selectS3BucketCredentials} from '@common/core/reducers/common-auth-reducer';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {Observable, Subscription} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {ChangeProjectDialogComponent} from '@common/experiments/shared/components/change-project-dialog/change-project-dialog.component';
import {fetchModelsRequested, modelSelectionChanged, setSelectedModels} from '../../actions/models-view.actions';
import {SelectedModel} from '../../shared/models.model';
import {CommonDeleteDialogComponent} from '@common/shared/entity-page/entity-delete/common-delete-dialog.component';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {CancelModelEdit} from '../../actions/models-info.actions';
import {BaseContextMenuComponent} from '../../../shared/components/base-context-menu/base-context-menu.component';
import {
  selectionDisabledArchive,
  selectionDisabledMoveTo,
  selectionDisabledPublishModels
} from '../../../shared/entity-page/items.utils';
import {getSignedUrl} from '../../../core/actions/common-auth.actions';
import {selectSignedUrl} from '../../../core/reducers/common-auth-reducer';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {get} from 'lodash/fp';


@Component({
  selector: 'sm-model-menu',
  templateUrl: './model-menu.component.html',
  styleUrls: ['./model-menu.component.scss']
})
export class ModelMenuComponent extends BaseContextMenuComponent implements OnInit, OnDestroy{

  readonly ICONS = ICONS;
  private S3BucketCredentials: Observable<any>;
  public modelSignedUri: string;
  public _model: any;
  public isExample: boolean;
  public isLocalFile: boolean;
  public isArchive: boolean;
  private projectId: string;
  private subscription: Subscription;

  @Input() set model(model: SelectedModel) {
    this._model = model;
    this.isExample = isReadOnly(model);
    this.isLocalFile = this.adminService.isLocalFile(model?.uri);
    this.isArchive = model?.system_tags?.includes('archived');
  }

  get model() {
    return this._model;
  }

  @Input() selectedModel: SelectedModel;
  @Input() selectedModels: SelectedModel[];
  @Input() numSelected = 0;
  @Input() projectTags: string[];
  @Input() companyTags: string[];
  @Input() tagsFilterByProject: boolean;
  @Input() showButton = true;
  @Output() tagSelected = new EventEmitter<string>();

  constructor(
    protected dialog: MatDialog,
    protected store: Store<ModelInfoState>,
    protected adminService: AdminService,
    protected eRef: ElementRef
  ) {
    super(store, eRef);
    this.S3BucketCredentials = store.select(selectS3BucketCredentials);
  }

  ngOnInit(): void {
    this.subscription = this.store.select(selectRouterParams)
      .pipe(map(params => get('projectId', params)))
      .subscribe((id => this.projectId = id));
  }

  archiveClicked() {
    // info header case
    const selectedModels = this.selectedModels ? selectionDisabledArchive(this.selectedModels).selectedFiltered : [this.selectedModel];

    if (this.isArchive) {
      this.store.dispatch(restoreSelectedModels({selectedEntities: selectedModels, skipUndo: false}));
    } else {
      this.store.dispatch(archivedSelectedModels({selectedEntities: selectedModels, skipUndo: false}));
    }
  }

  public publishPopup() {
    const selectedModels = this.selectedModels ? selectionDisabledPublishModels(this.selectedModels).selectedFiltered : [this.model];

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'PUBLISH',
        body: `<b>${selectedModels.length === 1 ? htmlTextShorte(selectedModels[0].name) : selectedModels.length + ' models'}</b> status will be set to Published.
<br><br>Published models are read-only and cannot be reset.`,
        yes: 'Publish',
        no: 'Cancel',
        iconClass: 'd-block fas fa-cloud-upload-alt fa-7x w-auto',
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.publishModel(selectedModels);
      }
    });
  }

  publishModel(selectedModels: SelectedModel[]) {
    this.store.dispatch(publishModelClicked({selectedModels}));
  }

  public moveToProjectPopup() {
    const selectedModels = this.selectedModels ? selectionDisabledMoveTo(this.selectedModels).selectedFiltered : [this.model];
    const currentProjects = Array.from(new Set(selectedModels.map(exp => exp.project?.id).filter(p => p)));
    const dialog = this.dialog.open(ChangeProjectDialogComponent, {
      data: {
        currentProjects: currentProjects.length > 0 ? currentProjects : [selectedModels[0].project?.id],
        defaultProject: selectedModels[0].project?.id,
        reference: selectedModels.length > 1 ? selectedModels : selectedModels[0]?.name,
        type: 'model'
      }
    });
    dialog.afterClosed().pipe(filter(project => !!project)).subscribe(project => {
      this.moveToProjectClicked(project, selectedModels);
    });

  }

  moveToProjectClicked(project, selectedModels) {
    this.store.dispatch(changeProjectRequested({selectedModels, project}));
  }

  public downloadModelFileClicked = () => {
    const url = this.model.uri;
    this.store.dispatch(getSignedUrl({url}));
    this.store.select(selectSignedUrl(url))
      .pipe(
        filter(signed => !!signed?.signed),
        map(({signed: signedUrl}) => signedUrl),
        take(1)
      ).subscribe(signed => {
      const a = document.createElement('a') as HTMLAnchorElement;
      a.target = '_blank';
      a.href = signed;
      a.click();
    });
  };

  public downloadModelFile = () => {
    const a = document.createElement('a') as HTMLAnchorElement;
    a.target = '_blank';
    a.href = this.modelSignedUri;
    a.click();
  };

  deleteModelPopup() {
    const confirmDialogRef = this.dialog.open(CommonDeleteDialogComponent, {
      data: {
        entity: this._model,
        numSelected: this.numSelected,
        entityType: EntityTypeEnum.model,
        useCurrentEntity: this.showButton
      },
      width: '600px',
      disableClose: true
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(setSelectedModels({models: []}));
        this.store.dispatch(modelSelectionChanged({model: null, project: this.projectId || this.model?.project?.id || '*'}));
        this.store.dispatch(fetchModelsRequested());
        this.store.dispatch(new CancelModelEdit());
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
