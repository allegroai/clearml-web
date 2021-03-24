import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import * as experimentsActions from '../actions/common-experiments-view.actions';
import {neverShowPopupAgain} from '../../core/actions/layout.actions';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';

export function convertStopToComplete(tasks) {
  return tasks.map(task => {
    if (task.status === 'closed') {
      task.status = 'completed';
    }
    return task;
  });
}


export function showConfirmArchiveExperiments(store: Store, dialog: MatDialog): void {
  const confirmDialogRef = dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'ARCHIVE A PUBLICLY SHARED TASK',
      body: `This task is accessible through a public access link.
            Archiving will disable public access`,
      yes: 'OK',
      no: 'Cancel',
      iconClass: 'al-icon al-ico-archive al-color',
      showNeverShowAgain: true
    }
  });
  confirmDialogRef.afterClosed().subscribe((confirmed) => {
    if (confirmed) {
      store.dispatch(new experimentsActions.ArchiveSelectedExperiments({}));
      if (confirmed.neverShowAgain) {
        store.dispatch(neverShowPopupAgain({popupId: 'archive-shared-task'}));
      }
    }
  });
}
