import {Component, Input, OnInit} from '@angular/core';

declare type CircleTypeEnum = 'completed' | 'running' | 'pending' | 'empty' | 'model-labels';

@Component({
  selector   : 'sm-circle-counter',
  templateUrl: './circle-counter.component.html',
  styleUrls  : ['./circle-counter.component.scss']
})
export class CircleCounterComponent implements OnInit {
  @Input() counter: any;
  @Input() label: string;
  @Input() underLabel: string;
  @Input() type: CircleTypeEnum = 'empty';

  constructor() {
  }

  ngOnInit() {
  }

}
