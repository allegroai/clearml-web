import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {trackByIndex} from "@common/shared/utils/forms-track-by";

export interface CirclesInRowInterface {
  name?: string;
  initials?: string;
}
@Component({
  selector: 'sm-circles-in-row',
  templateUrl: './circles-in-row.component.html',
  styleUrls: ['./circles-in-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CirclesInRowComponent implements OnInit {

  @Input() data: CirclesInRowInterface[] = [];
  @Input() stagger: string | number;
  @Input() isStagger: boolean;
  @Input() set staggerAmount(staggerAmount: number) {
    this._staggerAmount = new Array(staggerAmount).map( (x, index) => index);
  };
  @Input() limit;

  get staggerArray() {
    return this._staggerAmount;
  }
  trackBy = trackByIndex;
  private _staggerAmount: any[] = [];
  constructor() { }

  ngOnInit(): void {}

}
