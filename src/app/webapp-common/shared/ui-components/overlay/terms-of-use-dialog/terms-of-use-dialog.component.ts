import {Component, Inject, HostListener, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector   : 'sm-terms-of-use-dialog',
  templateUrl: './terms-of-use-dialog.component.html',
  styleUrls  : ['./terms-of-use-dialog.component.scss']
})
export class TermsOfUseDialogComponent implements AfterViewChecked {

  text;
  disabled = true;
  @ViewChild('box', { static: true }) box: ElementRef;
  private version: number;

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
      this.disabled = false;
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<any>) {
    this.version = data.version;
    // TODO: (nir) hack to prevent auto scrolling to first <a>
    this.text = '<a href="#"></a>' + data.externalData;
  }

  ngAfterViewChecked(): void {
    this.disabled = this.disabled && this.box.nativeElement.scrollHeight > this.box.nativeElement.clientHeight;
  }

  openTerms() {
    window.open('/', '_blank');
  }

  closeDialog() {
    this.dialogRef.close(this.version);
  }

}
