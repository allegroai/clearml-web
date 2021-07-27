import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector   : 'sm-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls  : ['./dialog-template.component.scss']
})
export class DialogTemplateComponent {


  @Input() displayX: boolean = true;
  @Input() closeOnX: boolean = true;

  @Input() theme: string = 'light-theme';
  @Input() closedCodeLabel: string = 'VIEW COMMAND LINE';
  @Input() iconClass: string; // the icon class (see icons.scss).
  @Input() iconData: string;
  @Input() header: string;
  @Input() subHeader: string;
  @Input() codeParams;
  @Input() codeTemplateFileName;
  @Output() xClicked = new EventEmitter();

  @ViewChild('container') container: ElementRef<HTMLDivElement>;
  constructor(private dialog: MatDialogRef<DialogTemplateComponent, any>) {
  }

  onXPressed() {
    if (this.closeOnX) {
      this.dialog.close();
    }
    this.xClicked.emit();
  }

}

