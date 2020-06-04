import {Component, Input, OnInit} from '@angular/core';



@Component({
  selector: 'sm-model-type-icon-label',
  templateUrl: './model-type-icon-label.component.html',
  styleUrls: ['./model-type-icon-label.component.scss']
})
export class ModelTypeIconLabelComponent implements OnInit {
  @Input() type;
  constructor() { }

  ngOnInit() {
  }

}
