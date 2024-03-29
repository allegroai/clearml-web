import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {openMoreInfoPopup} from '@common/core/actions/projects.actions';
import {htmlTextShort} from '../../../utils/shared-utils';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'sm-operation-error-dialog',
  templateUrl: './operation-error-dialog.component.html',
  styleUrls: ['./operation-error-dialog.component.scss'],
  standalone: true,
  imports: [
    DialogTemplateComponent,
    NgIf,
    NgForOf
  ]
})
export class OperationErrorDialogComponent {

  public title: string;
  public iconClass = '';
  public action: ReturnType<typeof openMoreInfoPopup>;
  public failed: number;
  public failedList: any[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
                title: string;
                action: ReturnType<typeof openMoreInfoPopup>;
                iconClass: string;
              },
              public dialogRef: MatDialogRef<OperationErrorDialogComponent>) {
    this.title = data.title || '';
    this.action = data.action;
    this.failedList = data.action.res.failed || [];
    this.failed = data.action.res.failed.length || 0;
    this.iconClass = data.iconClass || '';
  }

  getName(fail: any) {
    return htmlTextShort(this.action.parentAction.selectedEntities.find(entity => entity.id === fail.id)?.name);
  }
}
