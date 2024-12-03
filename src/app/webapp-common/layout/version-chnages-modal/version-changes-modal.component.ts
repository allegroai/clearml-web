import {ChangeDetectionStrategy, Component, Inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {addMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '@common/constants';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {Change} from '@common/shared/services/changes.service';

export interface ChangesModalData {
  changes: Change[];
  visitedIndex: number;
  mainTitle?: string;
}


@Component({
  selector: 'sm-version-changes-modal',
  templateUrl: './version-changes-modal.component.html',
  styleUrls: ['./version-changes-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogTemplateComponent,
    ClickStopPropagationDirective,
    SaferPipe,
    TooltipDirective,
    MatCheckbox,
    FormsModule
  ],
  standalone: true
})
export class VersionChangesModalComponent {
  public changes = signal<Change[]>(this.data.changes);
  private visitedIndex = signal(0);
  public mainTitle = signal<string>(this.data.mainTitle);
  public changeIndex = signal(0);
  neverShowAgain: boolean;

  constructor(public matDialogRef: MatDialogRef<VersionChangesModalComponent>, private store: Store,
              @Inject(MAT_DIALOG_DATA) public data: ChangesModalData) {
    this.visitedIndex.set(data.visitedIndex % this.changes().length);
    this.changeIndex.set(this.visitedIndex());
    this.saveIndexInLocalstorage();
    this.matDialogRef.beforeClosed().subscribe(res => this.neverShowAgain && !res ? this.matDialogRef.close(this.neverShowAgain) : false);
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  prev() {
    this.changeIndex.set((this.changes().length + this.changeIndex() - 1) % this.changes().length);
  }

  next() {
    this.changeIndex.set((this.changeIndex() + 1) % this.changes().length);
    this.saveIndexInLocalstorage();
  }

  private saveIndexInLocalstorage() {
    if (this.visitedIndex() <= this.changeIndex()) {
      this.visitedIndex.set(this.changeIndex() + 1);
      // window.localStorage.setItem('tipVisitedIndex', `${this.visitedIndex()}`);
    }
  }
}
