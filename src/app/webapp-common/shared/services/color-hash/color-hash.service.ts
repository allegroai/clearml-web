import { Injectable } from '@angular/core';
import {IHue} from './color-hash.model';
import {BehaviorSubject} from 'rxjs';
import {Store} from '@ngrx/store';
import {UsersState} from '../../../core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';
import {selectColorPreferences} from '../../ui-components/directives/choose-color/choose-color.reducer';
import {addUpdateColorPreferences, ColorPreference} from '../../ui-components/directives/choose-color/choose-color.actions';
import {getHslContrast, hexToRgb, hslToRgb, RGB2HEX, rgbToHsl} from './color-hash.utils';
import stc from 'string-to-color';
import hexRgb from 'hex-rgb';

export interface ColorCache {[label: string]: number[]};
export const DOT_PLACEHOLDER = '--DOT--';


@Injectable()
export class ColorHashService {
  hueRanges: Array<IHue>;

  hash;
  lightness;
  private _colorCache: BehaviorSubject<ColorCache> = new BehaviorSubject({});
  getColorCache() {
    return this._colorCache.asObservable();
  }

  setColorCache(obj: ColorCache) {
    this._colorCache.next(obj);
  }

  constructor(private store: Store<UsersState>) {
    this.store.select(selectColorPreferences)
      .pipe(
        filter(preferenceColors => !!preferenceColors),
        take(1)
      )
      .subscribe(preferenceColors => this.batchUpdateColorCache(preferenceColors));
  }

  public initColor(label: string) {
    const colorCache = this._colorCache.getValue();
    if (colorCache && colorCache[label]) {
      return colorCache[label];
    }
    const {red, green, blue} = hexRgb(stc(label));
    const color = [red, green, blue];
    this.setColorForString(label, color, false);
    return color;
  }

  public getColorsObservable() {
    return this.getColorCache();
  }

  private batchUpdateColorCache(colors: ColorPreference) {
    const newColorCache = {...this._colorCache.getValue(), ...colors};
    const filteredCache = {};
    Object.keys(newColorCache).forEach(color => {
      const regex             = new RegExp(DOT_PLACEHOLDER, 'g');
      const cleanKey          = color.replace(regex, '.');
      filteredCache[cleanKey] = newColorCache[color];
    });
    this.setColorCache(filteredCache);
  }

  private updateColorCache(str: string, color: number[]) {
    const newColorCache = this._colorCache.getValue();
    newColorCache[str]  = color;
    this.setColorCache(newColorCache);
  }

  setColorForString(str: string, color: number[], savePreference: boolean = true) {
    this.updateColorCache(str, color);
    if (savePreference) {
      const cleanString     = str.replace(/\./, DOT_PLACEHOLDER);
      this.store.dispatch(addUpdateColorPreferences({[cleanString]: color}));
    }
  }

  public hex(hash: string) {
    const rgb = this.initColor(hash);
    return RGB2HEX(rgb);
  }

  public getRgbString(str, opacity = -1) {
    const color = this.initColor(str);
    if (opacity !== -1) {
      return `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
    } else {
      return `rgb(${color[0]},${color[1]},${color[2]})`;
    }
  }

  getMonochromaticHarmony(color, isDarkBg = false) {
    const backgroundSaturation = 0.10;
    const minLightness         = 0.20;
    const maxLightness         = 0.95;
    const stepSize             = 0.05;
    const contrastLimit        = 3.9;

    const rgb         = Array.isArray(color) ? color : hexToRgb(color);
    const originalHsl = rgbToHsl(rgb);
    const hsl         = [...originalHsl];
    hsl[1]            = backgroundSaturation;
    hsl[2]            = isDarkBg ? minLightness : maxLightness;
    let contrast      = getHslContrast(originalHsl, hsl);
    while (contrast < contrastLimit) {
      contrast = getHslContrast(originalHsl, hsl);
      hsl[2]   = isDarkBg ? hsl[2] + stepSize : hsl[2] - stepSize;
      if ((!isDarkBg && hsl[2] < minLightness) || (isDarkBg && hsl[2] > maxLightness)) {
        break;
      }
    }
    return hslToRgb(hsl);
  }
}

