import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IModelInfoInput, IModelInfoOutput, IModelInfoSource} from '../../shared/common-experiment-model.model';
import {MatDialog} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';
import {ModelAutoPopulateDialogComponent} from '../model-auto-populate-dialog/model-auto-populate-dialog.component';
import {Model} from '../../../../business-logic/model/models/model';
import {SelectModelComponent} from '../../../select-model/select-model.component';
import {AdminService} from '../../../../features/admin/admin.service';
import {Store} from '@ngrx/store';
import {areLabelsEqualss} from '../../../../features/experiments/shared/experiments.utils';
import {BaseClickableArtifact} from '../base-clickable-artifact';


@Component({
  selector: 'sm-experiment-models-form-view',
  templateUrl: './experiment-models-form-view.component.html',
  styleUrls: ['./experiment-models-form-view.component.scss']
})
export class ExperimentModelsFormViewComponent extends BaseClickableArtifact {

  public isLocalFile: boolean;
  private _model: IModelInfoInput;
  @Input() projectId: string;
  @Input() editable: boolean;
  @Input() networkDesign: string;
  @Input() modelLabels: Model['labels'];
  @Input() source: IModelInfoSource;
  @Input() output: IModelInfoOutput;
  @Input() experimentName: string;

  @Input() set model(model: IModelInfoInput) {
    this._model = model;
    this.isLocalFile = model && model.url && this.adminService.isLocalFile(model.url);
  }

  get model(): IModelInfoInput {
    return this._model;
  }

  @Output() modelSelected = new EventEmitter<Model>();

  constructor(private dialog: MatDialog, protected adminService: AdminService, protected store: Store<any>) {
    super(adminService, store);
  }

  public chooseModel() {
    const chooseModelDialog = this.dialog.open(SelectModelComponent);
    chooseModelDialog.afterClosed()
      .pipe(filter(model => !!model))
      .subscribe((selectedModel: Model) => this.modelSelected.emit(selectedModel));
  }

  removeModel() {
    this.modelSelected.emit({id: null});
  }
}
