import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {trackByIndex} from '@common/shared/utils/forms-track-by';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {slice} from 'lodash-es';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {InitialsPipe} from '@common/shared/pipes/initials.pipe';

export interface CirclesInRowInterface {
  name?: string;
  initials?: string;
  class?: string;
}
@Component({
  selector: 'sm-circles-in-row',
  templateUrl: './circles-in-row.component.html',
  styleUrls: ['./circles-in-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    TooltipDirective,
    InitialsPipe,
    SlicePipe
  ]
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

  protected readonly slice = slice;
}
