import {Component, Input, OnDestroy} from '@angular/core';
import {IModelInfoInput, IModelInfoOutput, IModelInfoSource} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {AdminService} from '../../../../features/admin/admin.service';
import {Store} from '@ngrx/store';
import {BaseClickableArtifact} from '../base-clickable-artifact';


@Component({
  selector   : 'sm-experiment-output-model-view',
  templateUrl: './experiment-output-model-view.component.html',
  styleUrls  : ['./experiment-output-model-view.component.scss']
})
export class ExperimentOutputModelViewComponent extends BaseClickableArtifact implements OnDestroy {

  public isLocalFile: boolean;
  private _output: IModelInfoOutput;

  @Input() projectId: string;
  @Input() editable: boolean;
  @Input() networkDesign: string;
  @Input() modelLabels: Model['labels'];
  @Input() source: IModelInfoSource;
  @Input() model: IModelInfoInput;

  @Input() set output(output: IModelInfoOutput) {
    this._output = output;
    this.isLocalFile = output && output.url && this.adminService.isLocalFile(output.url);
  }

  get output(): IModelInfoOutput {
    return this._output;
  }

  constructor(protected adminService: AdminService, protected store: Store<any>) {
    super(adminService, store);
  }
}
