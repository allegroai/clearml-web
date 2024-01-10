import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sm-labeled-row',
  templateUrl: './labeled-row.component.html',
  styleUrls: ['./labeled-row.component.scss'],
  standalone: true,
  imports: [
    NgIf
  ]
})
export class LabeledRowComponent {
  @Input() label: string;
  @Input() showRow? = true;
  @Input() labelClass: string;
}
