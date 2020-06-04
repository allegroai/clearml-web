import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-plus-card',
  templateUrl: './plus-card.component.html',
  styleUrls  : ['./plus-card.component.scss']
})
export class PlusCardComponent implements OnInit {
  @Output() plusCardClick = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  public plusCardClicked() {
    this.plusCardClick.emit();
  }

}
