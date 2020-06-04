import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'sm-getting-started-card',
  templateUrl: './getting-started-card.component.html',
  styleUrls: ['./getting-started-card.component.scss']
})
export class GettingStartedCardComponent implements OnInit {
  @Input() icon;
  @Input() title;
  @Input() subtitle;
  @Input() buttonLabel;
  @Output() buttonClicked = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
