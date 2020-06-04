import {Component, Input, ChangeDetectorRef} from '@angular/core';

declare const nunjucks;
declare const PR;

@Component({
  selector   : 'sm-code',
  templateUrl: './code.component.html',
  styleUrls  : ['./code.component.scss']
})
export class CodeComponent {

  public CODE_TEMPLATES_PATH = 'examples/code/';
  public hack: boolean       = true;
  public isCodeOpen: boolean = false;
  public copied: boolean     = false;
  public codeResult: string;

  @Input() closedCodeLabel;
  @Input() codeSnippet: string;
  @Input() codeHeight    = '25vh';
  @Input() openCodeTop   = '0vh';
  @Input() closedCodeTop = '0vh';
  @Input() codeTemplateFileName: string;

  @Input() set params(params) {
    if (params) {
      this.copied = false;
      nunjucks.render(this.CODE_TEMPLATES_PATH + this.codeTemplateFileName, params, (err, res) => {
        this.codeResult = res;
        this.rerenderCode();
      });
      this.rerenderCode();
    }
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    nunjucks.configure('static', {web: {useCache: true, async: true}});
  }
  public textCopied(){
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
      this.changeDetectorRef.detectChanges();
    }, 2000);
  }

  private rerenderCode() {
    if (!this.changeDetectorRef['destroyed']) {
      this.hack = false;
      this.changeDetectorRef.detectChanges();
      this.hack = true;
      this.changeDetectorRef.detectChanges();
      PR.prettyPrint();
    }
  }
}
