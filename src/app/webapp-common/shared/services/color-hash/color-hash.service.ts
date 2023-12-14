import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Store} from '@ngrx/store';
import {UsersState} from '@common/core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';
import {selectColorPreferences} from '../../ui-components/directives/choose-color/choose-color.reducer';
import {addUpdateColorPreferences, ColorPreference} from '../../ui-components/directives/choose-color/choose-color.actions';
import stc from 'string-to-color';
import tinycolor from 'tinycolor2';
export interface ColorCache {[label: string]: number[]}
export const DOT_PLACEHOLDER = '--DOT--';


@Injectable()
export class ColorHashService {

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

  public initColor(label: string, initColor?: number[], lighten = false): number[] {
    const colorCache = this._colorCache.getValue()?.[label];
    if (colorCache) {
      return colorCache;
    }
    const tColor = tinycolor(stc(label));
    const tLum = tColor.getLuminance();
    if (tLum < 0.3 && lighten) {
      tColor.lighten(30 - tLum * 100);
    }
    const {r, g, b} = tColor.toRgb();
    const color = initColor ? initColor : [r, g, b];
    this.setColorForString(label, color, false);
    return color;
  }

  public hasColor(label: string): boolean {
    return !!this._colorCache.getValue()[label];
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
    if (savePreference) {
      this.updateColorCache(str, color);
      const cleanString     = str.replace(/\./, DOT_PLACEHOLDER);
      this.store.dispatch(addUpdateColorPreferences({[cleanString]: color}));
    }
  }

  public hex(hash: string) {
    const rgb = this.initColor(hash);
    return tinycolor({r: rgb[0], g: rgb[1], b: rgb[2], a: rgb[3]}).toHexString();
  }

  public getRgbString(str, opacity = -1) {
    const color = this.initColor(str);
    if (opacity !== -1) {
      return `rgba(${color[0]},${color[1]},${color[2]},${opacity})`;
    } else {
      return `rgb(${color[0]},${color[1]},${color[2]})`;
    }
  }
}

