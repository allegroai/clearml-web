import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector       : 'sm-card2',
  templateUrl    : './card-component2.component.html',
  styleUrls      : ['./card-component2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent2 implements OnInit {

  @Input() header: string;
  @Input() text: string;
  @Input() showBorder      = false;
  @Input() headerClassName = '';

  constructor() {
  }

  ngOnInit() {
  }

}
