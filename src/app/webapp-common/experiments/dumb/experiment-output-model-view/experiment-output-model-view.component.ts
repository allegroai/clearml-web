import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {
  IModelInfoInput, IModelInfoOutput, IModelInfoSource
} from '../../shared/common-experiment-model.model';
import {skip} from 'rxjs/operators';
import {Model} from '../../../../business-logic/model/models/model';
import {AdminService} from '../../../../features/admin/admin.service';
import {Store} from '@ngrx/store';
import {selectS3BucketCredentials} from '../../../core/reducers/common-auth-reducer';
import {Observable, Subscription} from 'rxjs';
import {BaseClickableArtifact} from '../base-clickable-artifact';


@Component({
  selector   : 'sm-experiment-output-model-view',
  templateUrl: './experiment-output-model-view.component.html',
  styleUrls  : ['./experiment-output-model-view.component.scss']
})
export class ExperimentOutputModelViewComponent extends BaseClickableArtifact implements OnDestroy {

  public isLocalFile: boolean;
  private _model: IModelInfoInput;

  @Input() projectId: string;
  @Input() editable: boolean;
  @Input() networkDesign: string;
  @Input() modelLabels: Model['labels'];
  @Input() source: IModelInfoSource;
  @Input() output: IModelInfoOutput;

  @Input() set model(model: IModelInfoInput) {
    this._model = model;
    this.isLocalFile = model && model.url && this.adminService.isLocalFile(model.url);
  }

  get model(): IModelInfoInput {
    return this._model;
  }

  @Output() modelSelected = new EventEmitter<{
    model: Model;
    fieldsToPopulate: { labelEnum: boolean; networkDesign: boolean };
  }>();

  constructor(protected adminService: AdminService, protected store: Store<any>) {
    super(adminService, store);
  }
}
