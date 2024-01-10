import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {CdkScrollable} from '@angular/cdk/overlay';

@Component({
  selector: 'sm-wizard-dialog-step',
  templateUrl: './wizard-dialog-step.component.html',
  styleUrls: ['./wizard-dialog-step.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    CdkScrollable
  ]
})
export class WizardDialogStepComponent {
  @Input() icon: string;
  @Input() label: string;
  @Input() subLabel: string;
  @Input() stepNumber: number  = 0;
  @Input() hideStep: boolean   = false;
  @Input() showFooter: boolean = true;
  @Input() enableIconAnimation = true;
}
