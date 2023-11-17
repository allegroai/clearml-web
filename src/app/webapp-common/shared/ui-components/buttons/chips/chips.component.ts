import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';
import {filter} from 'rxjs/operators';
import {FORCED_COLORS_FOR_STRING} from '../../../services/color-hash/color-hash-constants';
import {Subscription} from 'rxjs';
import {getCssTheme} from '../../../utils/shared-utils';
import {invertRgb} from '../../../services/color-hash/color-hash.utils';
import { TinyColor, mostReadable } from '@ctrl/tinycolor';

@Component({
  selector: 'sm-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsComponent implements OnInit, OnDestroy {

  public color: string;
  public backgroundColor: string;
  public colorIsForced: boolean = false;
  public colorTuple: number[];
  private _label: string;
  private colorSub: Subscription;

  @Input() set label(label) {
    if (Array.isArray(label) && label.length === 1) {
      label = label[0];
    }
    const initColor = this.colorHash.initColor(label);
    this.chooseColor(initColor);
    this._label = label;
  }

  get label() {
    return this._label;
  }

  // Default options are defined in getColorScheme
  @Input() isDarkBackground: boolean = true;

  @Input() maxWidth: string = '100%';
  @Input() allowRemove: boolean = false;
  @Output() remove = new EventEmitter<any>();

  constructor(private colorHash: ColorHashService, private changeDetection: ChangeDetectorRef, public elRef: ElementRef<HTMLElement>) {

  }

  ngOnInit() {
    this.isDarkBackground = (getCssTheme(this.elRef.nativeElement) == 'dark-theme');
    const colorObservable = this.colorHash.getColorsObservable();
    this.colorSub = colorObservable.pipe(
      filter((colorObj) => colorObj[this.label] !== this.colorTuple)
    ).subscribe(colorObj => {
      const color = colorObj[this.label];
      this.colorTuple = color;
      this.chooseColor(color);
      this.changeDetection.detectChanges();
    });
  }

  chooseColor(color: number[]) {
    if (FORCED_COLORS_FOR_STRING[this.label]) {
      this.colorIsForced = true;
      const forcedColor = FORCED_COLORS_FOR_STRING[this.label];
      color = this.isDarkBackground ? invertRgb(forcedColor) : forcedColor;
    }
    if (!color) {
      return;
    }
    this.color = `rgb(${color[0]},${color[1]},${color[2]})`;
    const t = new TinyColor(this.color);
    const background = mostReadable(t.toString(), t.isDark() ?
      [t.lighten(35).toString(), t.lighten(25).toString(), t.lighten(15).toString()] :
      [t.darken(35).toString(), t.darken(25).toString(), t.darken(15).toString()], {includeFallbackColors:false, level: 'AA'});
    this.backgroundColor = background.toRgbString();
  }

  ngOnDestroy(): void {
    this.colorSub.unsubscribe();
  }
}

