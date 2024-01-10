import {Component, Input} from '@angular/core';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {NA} from '~/app.constants';
import {fileSizeConfigCount, FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';


@Component({
  selector: 'sm-circle-counter',
  templateUrl: './circle-counter.component.html',
  styleUrls: ['./circle-counter.component.scss'],
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgForOf,
    NgSwitchDefault,
    NgIf,
    FileSizePipe
  ]
})
export class CircleCounterComponent {
  public valType: 'array' | 'number' | 'string';
  private _counter;
  public  NA = NA;
  @Input() set counter(val) { // number | string | {value: number | string; label: string}[];
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

  public fileSizeConfigCount = {...fileSizeConfigCount, spacer: '', round: 1};
  public fileSizeConfigShortCount = {...fileSizeConfigCount, spacer: '', round: 0};
}
