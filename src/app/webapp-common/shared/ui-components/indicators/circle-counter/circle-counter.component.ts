import {Component, Input} from '@angular/core';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {NA} from '~/app.constants';


@Component({
  selector: 'sm-circle-counter',
  templateUrl: './circle-counter.component.html',
  styleUrls: ['./circle-counter.component.scss']
})
export class CircleCounterComponent {
  public valType: 'array' | 'number' | 'string';
  private _counter: any;
  public  NA = NA;
  @Input() set counter(val: any) { // number | string | {value: number | string; label: string}[];
    this._counter = val;
    this.valType = Array.isArray(val) ? 'array' : Number.isInteger(val) ? 'number' : 'string';
  }
  get counter() {
    return this._counter;
  }
  @Input() label: string;
  @Input() underLabel: string;
  @Input() type: CircleTypeEnum = CircleTypeEnum.empty;
  trackByLabel = (index, counter) => counter.label;

  public fileSizeConfigCount = {
    base: 10,
    round: 0,
    spacer: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    symbols: {kB: 'K', k: 'K', B: ' ',  MB: 'M',  GB: 'G' }
  };

  isNumber(counter: any) {
    return Number.isInteger(counter);
  }
}
