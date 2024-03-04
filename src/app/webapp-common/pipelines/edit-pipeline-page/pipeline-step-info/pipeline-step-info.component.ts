import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Artifact} from '~/business-logic/model/tasks/artifact';

import {addMessage} from '@common/core/actions/layout.actions';
import {fileSizeConfigStorage} from '@common/shared/pipes/filesize.pipe';
import {ICONS, IOption, MESSAGES_SEVERITY} from '@common/constants';
import { MatOptionSelectionChange } from '@angular/material/core';
import { NgModel } from '@angular/forms';
import { trackByValue } from '@common/shared/utils/forms-track-by';
import { cloneDeep } from 'lodash-es';
import { ConfirmDialogComponent } from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'sm-pipeline-step-info',
  templateUrl: './pipeline-step-info.component.html',
  styleUrls: ['./pipeline-step-info.component.scss']
})
export class PipelineStepInfoComponent {
  readonly icons = ICONS;
  //private _entity: IExperimentInfo;
  public controller: boolean;
  public fileSizeConfigStorage = fileSizeConfigStorage;
  private _step;
  private _ioOptions: Array<{ label: string; value: string, type: string }> ;

  @Output() deleteStep = new EventEmitter<any>();
  @Output() stepParamsChanged = new EventEmitter<unknown>();

  @Input() set ioOptions(options: any) {
    const opts = options.map((op) => {
      if(op.type === "pipeline_parameter") {
        return {
          value: "${pipeline." + op.key +"}",
          label: `${op.stepName}.${op.key}`,
          type: op.type
        }
      } else {
        return {
          value: "${"+op.stepName+".id}."+op.key,
          label: `${op.stepName}.${op.key}`,
          type: op.type
        }
      }
     
    });

    this._ioOptions = cloneDeep(opts);
  }


  get ioOptions() {
    return this._ioOptions;
  }

  @Input() set step(step) {
    this._step = step ? cloneDeep(step) : null;
  }
  get step() {
    return this._step;
  }

  // for auto complete
  @ViewChild('optsInput') optsInput: NgModel;
  public trackByValue = trackByValue;
  isAutoCompleteOpen: boolean;
/*   public incommingInputOptions: { label: string; value: string }[] = [
    {label: "test", value: "test1"}
  ]; */
  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }
  displayFn(opt: IOption | string) {
    return typeof opt === 'string' ? opt : opt?.label;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  paramSelected($event: MatOptionSelectionChange) {
    
  }
  /* @Input() set entity(task: IExperimentInfo) {
    this._entity = task;
    this.controller = task?.type === TaskTypeEnum.Controller;
  }
  get entity() {
    return this._entity;
  } */

  paramsChanged() {
    setTimeout(()=> {
      this.stepParamsChanged.emit(this._step.data.parameters);
    }, 2000)
  }


  @Input() project: string;

  constructor(private store: Store, private matDialog: MatDialog) {
  }

  public deleteClicked() {
    this.matDialog
    .open(ConfirmDialogComponent, {
      data: {
        title: "DELETE",
        body: '<p class="text-center">Are you sure you want to delete the step?</p>',
        yes: "Delete",
        no: "Cancel",
        iconClass: "al-ico-trash",
        width: 430,
      },
    })
    .afterClosed().subscribe((data) => {
      // eslint-disable-next-line no-console
      console.log(data);
      if(data?.isConfirmed) {
          this.deleteStep.emit(this._step);
      }
    })
   
    /* setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(this._step);
    }, 3000) */
  }

  trackByFn = (index: number, artifact: Artifact) => artifact.hash || artifact.uri;

  copyToClipboard() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'ID copied successfully'));
  }
}
