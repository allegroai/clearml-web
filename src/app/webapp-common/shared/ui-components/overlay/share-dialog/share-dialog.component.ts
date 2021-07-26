import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IShareDialogConfig} from './share-dialog.model';
import {addMessage} from '../../../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../../../app.constants';
import {Store} from '@ngrx/store';
import {shareSelectedExperiments} from '../../../../experiments/actions/common-experiments-menu.actions';

@Component({
  selector: 'sm-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent {

  displayX: boolean = true;

  title: string;

  public subTitle: string;
  public link: string;
  shared: boolean = false;
  public sharedSubtitle: string;
  public privateSubtitle: string;
  private task: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: IShareDialogConfig,
              public dialogRef: MatDialogRef<ShareDialogComponent>,
              private store: Store<any>) {
    this.title = data.title || '';
    this.sharedSubtitle =`<b>Any registered user with this link</b> has read-only access to this task and all it’s contents (Artifacts, Results, etc.)`;
    this.privateSubtitle =  `Create a shareable link to grant read access to<b> any registered user</b> you provide this link to.`;
    this.task = data.task;

    this.link = data.link || '';
    this.shared = !!data.alreadyShared;
  }

  closeDialog(isConfirmed) {
    this.dialogRef.close({isConfirmed, shared: this.shared});
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  createLink() {
    this.store.dispatch(shareSelectedExperiments({share: !this.shared, task:this.task}));

    this.shared = !this.shared;
  }
}
