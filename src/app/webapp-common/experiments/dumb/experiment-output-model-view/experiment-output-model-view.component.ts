import {Component, Input, OnDestroy} from '@angular/core';
import {IModelInfo} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {AdminService} from '../../../../features/admin/admin.service';
import {Store} from '@ngrx/store';
import {BaseClickableArtifactComponent} from '../base-clickable-artifact.component';


@Component({
  selector   : 'sm-experiment-output-model-view',
  templateUrl: './experiment-output-model-view.component.html',
  styleUrls  : ['./experiment-output-model-view.component.scss']
})
export class ExperimentOutputModelViewComponent extends BaseClickableArtifactComponent implements OnDestroy {

  public isLocalFile: boolean;
  private _model: IModelInfo;

  @Input() projectId: string;
  @Input() editable: boolean;
  @Input() networkDesign: string;
  @Input() modelLabels: Model['labels'];

  @Input() set model(model: IModelInfo) {
    this._model = model;
    this.isLocalFile = model && model.uri && this.adminService.isLocalFile(model.uri);
  }

  get model(): IModelInfo {
    return this._model;
  }

  constructor(protected adminService: AdminService, protected store: Store<any>) {
    super(adminService, store);
  }
}
