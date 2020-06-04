import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sm-labeled-row',
  templateUrl: './labeled-row.component.html',
  styleUrls: ['./labeled-row.component.scss']
})
export class LabeledRowComponent implements OnInit {
  @Input() label: string;
  @Input() showRow? = true;
  @Input() labelClass: string;
  constructor() { }

  ngOnInit() {
  }

}
