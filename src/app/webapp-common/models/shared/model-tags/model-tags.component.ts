import {Component, Input, OnInit} from '@angular/core';

const TAGS_NUMBER_LONG  = 3;
const TAGS_NUMBER_SHORT = 2;

@Component({
  selector   : 'sm-model-tags',
  templateUrl: './model-tags.component.html',
  styleUrls  : ['./model-tags.component.scss']
})

export class ModelTagsComponent implements OnInit {
  private _tags: Array<string>;
  @Input() set tags(tags) {
    this._tags = tags || [];
  }

  get tags() {
    return this._tags;
  }

  TAGS_NUMBER_LONG  = TAGS_NUMBER_LONG;
  TAGS_NUMBER_SHORT = TAGS_NUMBER_SHORT;

  constructor() {
  }

  ngOnInit() {
  }

}
