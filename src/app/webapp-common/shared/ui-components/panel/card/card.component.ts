import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'sm-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() header: string;

  // TODO: delete the following:
  @Input() collapsed       = false;
  @Input() collapsible     = false;
  @Input() fixedSize       = false;
  @Input() overflowVisible = false;
  @Input() cardSign        = '';
  @Input() showSeperator   = true;
  @Input() whiteHeader     = false;
  @Input() whiterHeader    = false;
  @Input() isExample       = false;

  constructor() { }

  ngOnInit() {
  }

}
