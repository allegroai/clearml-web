import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sm-vertical-labeled-row',
  templateUrl: './vertical-labeled-row.component.html',
  styleUrls: ['./vertical-labeled-row.component.scss']
})
export class VerticalLabeledRowComponent implements OnInit {
  @Input() label: string;
  @Input() showRow? = true;
  @Input() labelClass: string;
  constructor() { }

  ngOnInit() {
  }

}
