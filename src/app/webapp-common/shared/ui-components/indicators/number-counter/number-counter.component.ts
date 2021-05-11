import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector   : 'sm-number-counter',
  templateUrl: './number-counter.component.html',
  styleUrls  : ['./number-counter.component.scss']
})
export class NumberCounterComponent implements OnInit {
  @Input() counter;
  @Input() label;
  constructor() {
  }


  ngOnInit() {
  }

}
