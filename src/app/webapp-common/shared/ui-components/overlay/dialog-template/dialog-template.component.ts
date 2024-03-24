import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NgClass, NgIf} from '@angular/common';
import {CdkScrollableModule} from '@angular/cdk/scrolling';

@Component({
  selector: 'sm-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls: ['./dialog-template.component.scss'],
  imports: [
    NgClass,
    NgIf,
    CdkScrollableModule
  ],
  standalone: true
})
export class DialogTemplateComponent {


  @Input() displayX: boolean = true;
  @Input() closeOnX: boolean = true;

  @Input() theme: string = 'light-theme';
  @Input() containerClass: string;
  @Input() closedCodeLabel: string = 'VIEW COMMAND LINE';
  @Input() iconClass: string; // the icon class (see icons.scss).
  @Input() iconData: string;
  @Input() header: string;
  @Input() subHeader: string;
  @Input() pageHeader: string;
  @Input() codeParams;
  @Output() xClicked = new EventEmitter();

  @ViewChild('container', {static: true}) container: ElementRef<HTMLDivElement>;
  constructor(private dialog: MatDialogRef<DialogTemplateComponent>) {
  }

  onXPressed() {
    if (this.closeOnX) {
      this.dialog.close();
    }
    this.xClicked.emit();
  }

}

