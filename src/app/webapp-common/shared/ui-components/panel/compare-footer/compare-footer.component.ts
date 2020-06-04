import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sm-compare-footer',
  templateUrl: './compare-footer.component.html',
  styleUrls: ['./compare-footer.component.scss']
})
export class CompareFooterComponent implements OnInit {

  @Input() visible = false;
  constructor() { }

  ngOnInit() {
  }

}
