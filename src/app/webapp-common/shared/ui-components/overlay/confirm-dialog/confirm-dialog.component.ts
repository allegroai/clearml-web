import {Component, ElementRef, Inject, Input, Renderer2, TemplateRef} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogConfig} from './confirm-dialog.model';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {SafePipe} from '@common/shared/pipes/safe.pipe';
import {NgIf, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'sm-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  standalone: true,
  imports: [
    DialogTemplateComponent,
    MatCheckboxModule,
    FormsModule,
    SafePipe,
    NgIf,
    NgTemplateOutlet
  ]
})
export class ConfirmDialogComponent {

  @Input() displayX: boolean = true;
  showNeverShowAgain: boolean;
  title: string;
  body?: string;
  template?: TemplateRef<any>;
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
    this.template = data.template;
    this.yes = data.yes || '';
    this.no = typeof data.no === 'string' && data?.no ? data.no : '';
    this.iconClass = data.iconClass || '';
    this.iconData = data.iconData || '';
    this.codeSnippet = data.codeSnippet || '';
    this.showNeverShowAgain = data.showNeverShowAgain || false;
    this.centerText = data.centerText ?? false;
    const width = data.width || 640;

    renderer.setStyle(ref.nativeElement, 'width', `${width}px`);
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      this.dialogRef.close({isConfirmed, neverShowAgain: this.neverShowAgain});
    } else {
      this.dialogRef.close(isConfirmed);
    }
  }
}
