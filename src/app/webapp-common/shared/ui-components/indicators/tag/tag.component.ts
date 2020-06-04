import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector   : 'sm-tag',
  templateUrl: './tag.component.html',
  styleUrls  : ['./tag.component.scss']
})
export class TagComponent implements OnInit {
  @Input() label: string;
  @Input() className: string;

  constructor() {
  }

  ngOnInit() {
  }

}
