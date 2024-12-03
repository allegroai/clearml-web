import {booleanAttribute, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';

@Component({
  selector: 'sm-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls: ['./dialog-template.component.scss'],
  imports: [
    CdkScrollableModule,
    SaferPipe
],
  standalone: true
})
export class DialogTemplateComponent {


  @Input({transform: booleanAttribute}) displayX = true;
  @Input({transform: booleanAttribute}) closeOnX = true;

  @Input() theme = 'light-theme';
  @Input() containerClass: string;
  @Input() closedCodeLabel = 'VIEW COMMAND LINE';
  @Input() iconClass: string; // the icon class (see icons.scss).
  @Input() iconData: string;
  @Input() header: string;
  @Input() subHeader: string;
  @Input() pageHeader: string;
  @Input() headerClass: string;
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

