import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IModelInfo, IModelInfoSource} from '../../shared/common-experiment-model.model';
import {MatDialog} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';
import {Model} from '../../../../business-logic/model/models/model';
import {SelectModelComponent} from '../../../select-model/select-model.component';
import {AdminService} from '../../../../features/admin/admin.service';
import {Store} from '@ngrx/store';
import {BaseClickableArtifactComponent} from '../base-clickable-artifact.component';


@Component({
  selector: 'sm-experiment-models-form-view',
  templateUrl: './experiment-models-form-view.component.html',
  styleUrls: ['./experiment-models-form-view.component.scss']
})
export class ExperimentModelsFormViewComponent extends BaseClickableArtifactComponent {

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
