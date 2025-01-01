import {Component, Input} from '@angular/core';


@Component({
  selector: 'sm-labeled-row',
  templateUrl: './labeled-row.component.html',
  styleUrls: ['./labeled-row.component.scss'],
  standalone: true,
  imports: []
})
export class LabeledRowComponent {
  @Input() label: string;
  @Input() showRow? = true;
  @Input() labelClass: string;
}
