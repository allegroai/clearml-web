import {Component, Input, OnInit} from '@angular/core';
import {CircleTypeEnum} from '../../../../../shared/constants/non-common-consts';


@Component({
  selector: 'sm-circle-counter',
  templateUrl: './circle-counter.component.html',
  styleUrls: ['./circle-counter.component.scss']
})
export class CircleCounterComponent implements OnInit {
  @Input() counter: any;
  @Input() label: string;
  @Input() underLabel: string;
  @Input() type: CircleTypeEnum = CircleTypeEnum.empty;

  constructor() {
  }

  ngOnInit() {
  }

}
