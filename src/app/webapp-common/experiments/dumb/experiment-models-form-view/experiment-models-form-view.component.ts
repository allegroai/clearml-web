import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {IModelInfo, IModelInfoSource} from '../../shared/common-experiment-model.model';
import {MatDialog} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';
import {Model} from '~/business-logic/model/models/model';
import {SelectModelComponent} from '@common/select-model/select-model.component';
import {AdminService} from '~/shared/services/admin.service';
import {Store} from '@ngrx/store';
import {BaseClickableArtifactComponent} from '../base-clickable-artifact.component';
import {addMessage} from '@common/core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '@common/constants';
import {resetSelectModelState} from '@common/select-model/select-model.actions';


@Component({
  selector: 'sm-experiment-models-form-view',
  templateUrl: './experiment-models-form-view.component.html',
  styleUrls: ['./experiment-models-form-view.component.scss']
})
export class ExperimentModelsFormViewComponent extends BaseClickableArtifactComponent implements OnDestroy{

  public isLocalFile: boolean;
  private _model: IModelInfo;
  @Input() projectId: string;
  @Input() editable: boolean;
  @Input() networkDesign: string;
  @Input() modelLabels: Model['labels'];
  @Input() source: IModelInfoSource;
  @Input() experimentName: string;
  @Input() showCreatedExperiment: boolean = true;

  @Input() set model(model: IModelInfo) {
    this._model = model;
    this.isLocalFile = model && model.uri && this.adminService.isLocalFile(model.uri);
  }

  get model(): IModelInfo {
    return this._model;
  }

  @Output() modelSelectedId = new EventEmitter<string>();

  constructor(private dialog: MatDialog) {
    super();
  }

  public chooseModel() {
    const chooseModelDialog = this.dialog.open(SelectModelComponent, {
      data: {
        header: 'Select a published model',
        hideShowArchived: true
      },
      width: '98%',
      height: '94vh',
      maxWidth: '100%',
    });
    chooseModelDialog.afterClosed()
      .pipe(filter(model => !!model))
      .subscribe((selectedModelId: string) => {
        this.modelSelectedId.emit(selectedModelId);
      });
  }

  removeModel() {
    this.modelSelectedId.emit(null);
  }

  copySuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'Copied to clipboard'));
  }

  ngOnDestroy(): void {
    this.store.dispatch(resetSelectModelState({fullReset: true}));
  }
}
