import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-copy-clipboard',
  templateUrl: './copy-clipboard.component.html',
  styleUrls  : ['./copy-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyClipboardComponent {

  @Input() clipboardText: string;
  @Input() disabled = false;
  @Input() label: string = 'Copy to clipboard';
  @Input() tooltipText = 'Copy to clipboard';
  @Input() hideBackground = false;
  @Input() theme: string;
  @Input() copyIcon: string;

  public copied = false;

  constructor(private cdr:ChangeDetectorRef) {
  }

  copyToClipboard() {
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 5000);
  }

}
