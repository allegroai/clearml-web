import {Component, Inject, OnDestroy} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {fromEvent, Subscription} from 'rxjs';

@Component({
  selector   : 'sm-terms-of-use-dialog',
  templateUrl: './terms-of-use-dialog.component.html',
  styleUrls  : ['./terms-of-use-dialog.component.scss']
})
export class TermsOfUseDialogComponent implements OnDestroy{

  text;
  disabled = true;
  private version: number;
  private scrollSub: Subscription;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<any>) {
    this.version = data.version;
    // TODO: (nir) hack to prevent auto scrolling to first <a>
    this.text = '<a href="#"></a>' + data.externalData;
  }

  openTerms() {
    window.open('/', '_blank');
  }

  closeDialog() {
    this.dialogRef.close(this.version);
  }

  iframeLoaded(event: Event) {
    const iframe = event.target as HTMLIFrameElement;
    const content = iframe.contentDocument.scrollingElement;
    this.scrollSub?.unsubscribe();
    const update = () => this.disabled = this.disabled && content.clientHeight + content.scrollTop + 5 < content.scrollHeight;
    update();
    this.scrollSub = fromEvent(iframe.contentWindow, 'scroll')
      .subscribe(update);
  }

  ngOnDestroy(): void {
    this.scrollSub?.unsubscribe();
  }
}
