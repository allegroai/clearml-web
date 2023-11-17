import {Component, Input} from '@angular/core';

@Component({
  selector   : 'sm-tag',
  templateUrl: './tag.component.html',
  styleUrls  : ['./tag.component.scss'],
  standalone: true
})
export class TagComponent {
  @Input() label: string;
  @Input() className: string;


}
