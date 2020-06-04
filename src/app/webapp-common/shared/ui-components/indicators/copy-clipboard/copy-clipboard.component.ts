import {Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-copy-clipboard',
  templateUrl: './copy-clipboard.component.html',
  styleUrls  : ['./copy-clipboard.component.scss']
})
export class CopyClipboardComponent {

  @Input() clipboardText: string;
  @Input() disabled = false;
  @Input() label: string = 'Copy to clipboard';
  @Input() tooltipText = 'Copy to clipboard';
  @Input() hideBackground = false;
  public copied = false;
  copyToClipboard() {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 5000);
  }

}
