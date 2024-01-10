import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'sm-leaf',
  templateUrl: './leaf.component.html',
  styleUrls: ['./leaf.component.scss'],
  standalone: true,
})
export class LeafComponent {
@Input() codeOpen: boolean = false;
@Input() codeEnabled: boolean = false;
@Output() chooseClicked = new EventEmitter();
}
