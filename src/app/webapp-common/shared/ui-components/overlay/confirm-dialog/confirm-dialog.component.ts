import {Component, ElementRef, Inject, Input, Renderer2} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogConfig} from './confirm-dialog.model';

@Component({
  selector: 'sm-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  @Input() displayX: boolean = true;
  showNeverShowAgain: boolean;
  title: string;
  body: string;
  yes = 'OK';
  no = 'Cancel';
  iconClass = '';
  iconData = '';
  codeSnippet = '';
  externalData: string = null;
  public reference: string;
  neverShowAgain: boolean;
  centerText: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogConfig,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private ref: ElementRef, private renderer: Renderer2
  ) {
    this.title = data.title || '';
    this.reference = data.reference || '';
    this.body = data.body || '';
    this.yes = data.yes || '';
    this.no = data.no || '';
    this.iconClass = data.iconClass || '';
    this.iconData = data.iconData || '';
    this.codeSnippet = data.codeSnippet || '';
    this.showNeverShowAgain = data.showNeverShowAgain || false;
    this.centerText = data.centerText ?? false;
    const width = data.width || 640;

    renderer.setStyle(ref.nativeElement, 'width', `${width}px`);
  }

  closeDialog(isConfirmed) {
    if(isConfirmed) {
      this.dialogRef.close({isConfirmed: isConfirmed, neverShowAgain: this.neverShowAgain});
    } else {
      this.dialogRef.close(isConfirmed);
    }
  }
}
