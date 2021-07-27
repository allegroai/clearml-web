import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {addMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {Tip} from '../../shared/services/tips.service';

@Component({
  selector: 'sm-tip-of-the-day-modal',
  templateUrl: './tip-of-the-day-modal.component.html',
  styleUrls: ['./tip-of-the-day-modal.component.scss']
})
export class TipOfTheDayModalComponent {
  public tipIndex: number;
  public tips: Tip[];
  neverShowAgain: boolean;
  private visitedIndex: number = 0;
  public hideDontShow: boolean;

  constructor(public matDialogRef: MatDialogRef<TipOfTheDayModalComponent>, private store: Store<any>,
              @Inject(MAT_DIALOG_DATA) public data: { tips: Tip[]; visitedIndex: number; hideDontShow: boolean }) {
    this.tips = data.tips;
    this.hideDontShow = data.hideDontShow;
    this.visitedIndex = data.visitedIndex % this.tips.length;
    this.tipIndex = this.visitedIndex;
    this.saveIndexInLocalstorage();
    this.matDialogRef.beforeClosed().subscribe(() => this.matDialogRef.close(this.neverShowAgain));
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  prev() {
    this.tipIndex = (this.tips.length + this.tipIndex - 1) % this.tips.length;
  }

  next() {
    this.tipIndex = (this.tipIndex + 1) % this.tips.length;
    this.saveIndexInLocalstorage();
  }

  private saveIndexInLocalstorage() {
    if (this.visitedIndex <= this.tipIndex) {
      this.visitedIndex = (this.tipIndex + 1);
      window.localStorage.setItem('tipVisitedIndex', `${this.visitedIndex}`);
    }
  }
}
