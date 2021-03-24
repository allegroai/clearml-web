import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'sm-leaf',
  templateUrl: './leaf.component.html',
  styleUrls: ['./leaf.component.scss']
})
export class LeafComponent implements OnInit {
@Input() codeOpen: boolean = false;
@Input() codeEnabled: boolean = false;
@Output() chooseClicked = new EventEmitter();


  constructor() { }

  ngOnInit() {
  }

}
