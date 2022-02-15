import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';
import {filter} from 'rxjs/operators';
import {FORCED_COLORS_FOR_STRING} from '../../../services/color-hash/color-hash-constants';
import {Subscription} from 'rxjs';
import {getCssTheme} from '../../../utils/shared-utils';
import {invertRgb} from '../../../services/color-hash/color-hash.utils';

@Component({
  selector       : 'sm-chips',
  templateUrl    : './chips.component.html',
  styleUrls      : ['./chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent implements OnInit, OnDestroy {

  public color: string;
  public backgroundColor: string;
  public colorIsForced: boolean = false;
  public colorTuple: number[];
  private _label: any;
  private colorSub: Subscription;
  private _forceColor: [number, number, number];

  @Input() set label(label) {
    const initColor = this.colorHash.initColor(label);
    this.chooseColor(initColor);
    this._label = label;
  }

  get label() {
    return this._label;
  }

  // Force setting a single RGB color
  @Input() set forceColor(forceColor: [number, number, number]) {
    this.colorIsForced = true;
    this._forceColor   = forceColor;

  }

  get forceColor() {
    return this._forceColor;
  }

  // Default options are defined in getColorScheme
  @Input() isDarkBackground: boolean = true;

  @Input() maxWidth: string     = '100%';
  @Input() allowRemove: boolean = false;
  @Output() remove              = new EventEmitter<any>();

  constructor(private colorHash: ColorHashService, private changeDetection: ChangeDetectorRef, private elRef: ElementRef<HTMLElement>) {

  }
  ngOnInit() {
    this.isDarkBackground = (getCssTheme(this.elRef.nativeElement) == 'dark-theme') ? true : false;
    const colorObservable = this.colorHash.getColorsObservable();
    this.colorSub         = colorObservable.pipe(
      filter((colorObj) => colorObj[this.label] !== this.colorTuple)
    ).subscribe(colorObj => {
      const color = this.forceColor ? this.forceColor : colorObj[this.label];
      this.colorTuple = color;
      this.chooseColor(color);
      this.changeDetection.detectChanges();
    });
  }

  chooseColor(color: number[]) {
    if (FORCED_COLORS_FOR_STRING[this.label]) {
      this.colorIsForced = true;
      const forcedColor  = FORCED_COLORS_FOR_STRING[this.label];
      color              = this.isDarkBackground ? invertRgb(forcedColor) : forcedColor;
    }
    if (!color) {
      return;
    }
    this.color           = `rgb(${color[0]},${color[1]},${color[2]})`;
    const background     = this.colorHash.getMonochromaticHarmony(color, this.isDarkBackground);
    this.backgroundColor = `rgb(${background[0]},${background[1]},${background[2]})`;
  }

  ngOnDestroy(): void {
    this.colorSub.unsubscribe();
  }
}

