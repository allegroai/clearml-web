import { Injectable } from '@angular/core';
import {IColorHashOptions, IHue} from './color-hash.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {IUsersState} from '../../../core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';
import {selectColorPreferences} from '../../ui-components/directives/choose-color/choose-color.reducer';
import {addUpdateColorPreferences, ColorPreference} from '../../ui-components/directives/choose-color/choose-color.actions';
import {getHslContrast, hexToRgb, HSL2RGB, hslToRgb, RGB2HEX, rgbToHsl} from './color-hash.utils';
import {crc32} from '../../utils/shared-utils';

@Injectable()
export class ColorHashService {
  hueRanges: Array<IHue>;

  hash;
  Saturation;
  Lightness;
  private _colorCache: BehaviorSubject<any> = new BehaviorSubject({});
  readonly DOT_PLACEHOLDER: string          = '--DOT--';
  getColorCache(): Observable<any> {
    return this._colorCache.asObservable();
  }

  setColorCache(obj: any) {
    this._colorCache.next(obj);
  }

  constructor(private store: Store<IUsersState>) {
    this.store.pipe(
      select(selectColorPreferences),
      filter(preferenceColors => !!preferenceColors),
      take(1)
    ).subscribe(preferenceColors => this.batchUpdateColorCache(preferenceColors));
  }

  /**
   * Returns the hash in [r, g, b].
   * Note that R, G, B ∈ [0, 255]
   *
   * @param {String} str string to hash
   * @param colorSchemeName
   * @returns {Array} [r, g, b]
   */
  public initColor(str: string, colorSchemeName?: string) {
    const options    = this.getColorScheme(colorSchemeName);
    const colorCache = this._colorCache.getValue();
    if (colorCache && colorCache[str]) {
      return colorCache[str];
    }
    this.init(options);
    const hsl   = this.hsl(str);
    const color = HSL2RGB.apply(this, hsl);
    this.setColorForString(str, color, false);
    return color;
  }

  public getColorsObservable() {
    return this.getColorCache();
  }

  private batchUpdateColorCache(colors: ColorPreference) {
    const newColorCache = {...this._colorCache.getValue(), ...colors};
    const filteredCache = {};
    Object.keys(newColorCache).forEach(color => {
      const regex             = new RegExp(this.DOT_PLACEHOLDER, 'g');
      const cleanKey          = color.replace(regex, '.');
      filteredCache[cleanKey] = newColorCache[color];
    });
    this.setColorCache(filteredCache);
  }

  private updateColorCache(str: string, color: Array<number>) {
    const newColorCache = this._colorCache.getValue();
    newColorCache[str]  = color;
    this.setColorCache(newColorCache);
  }

  setColorForString(str: string, color: Array<number>, savePreference: boolean = true) {
    this.updateColorCache(str, color);
    if (savePreference) {
      const cleanString     = str.replace(/\./, this.DOT_PLACEHOLDER);
      const colorObj        = {};
      colorObj[cleanString] = color;
      this.store.dispatch(addUpdateColorPreferences(colorObj));
    }
  }

  private getColorScheme(colorSchemeName): IColorHashOptions {
    const schemes = {
      LUMINOUS_EXCLUDING_PURPLE: {lightness: [0.4, 0.5, 0.6], saturation: [0.6, 0.7, 0.8, 0.9], hue: [{min: 0, max: 190}, {min: 250, max: 500}]},
    };
    return schemes[colorSchemeName] ? schemes[colorSchemeName] : schemes['LUMINOUS_EXCLUDING_PURPLE'];
  }

  private hsl(str) {
    let H, S, L;
    const hash = this.hash(str);

    const hueResolution = 727; // note that 727 is a prime
    const hue           = hash % hueResolution;
    const lightness     = Math.floor((hash / hueResolution)) % this.Lightness.length;
    const sat           = Math.floor(Math.floor(hash / hueResolution) / this.Lightness.length) % this.Saturation.length;
    const range         = this.hueRanges[hue % this.hueRanges.length];
    H                   = (hue * (range.max - range.min)) / hueResolution + range.min;
    //hash = Math.floor(hash / 360);
    S                   = this.Saturation[sat];
    //hash = Math.floor(hash / this.Saturation.length);
    L                   = this.Lightness[lightness];

    return [H, S, L];
  }

  /**
   * Returns the hash in hex
   *
   * @param {String} str string to hash
   * @returns {String} hex with #
   */
  public hex(str, colorSchemeName?: string) {
    // May be used later.
    const rgb = this.initColor(str, colorSchemeName);
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

  private init(options: IColorHashOptions) {
    const LS = [options.lightness, options.saturation].map(function (param: Array<number> | number) {
      param = param || [0.35, 0.5, 0.65]; // note that 3 is a prime // Sets defualt values
      return Array.isArray(param) ? param.concat() : [param];
    });

    this.Lightness  = LS[0];
    this.Saturation = LS[1];

    if (typeof options.hue === 'undefined') {
      options.hue = [];
    }
    this.hueRanges = options.hue.map(function (range) {
      return {
        min: range.min === undefined ? 0 : range.min,
        max: range.max === undefined ? 360 : range.max
      };
    });

    this.hash = crc32;
  }

  hashCode(str: string) {

    if (str && str.length < 3) {
      str = str.repeat(3);
    }
    str += 'xx';
    let hash = 0;
    let chr;
    if (str.length === 0) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      chr  = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  getMonochromaticHarmony(color, isDarkBg = false) {
    const backgroundSaturation = 0.10;
    const minLightness         = 0.20;
    const maxLightness         = 0.95;
    const stepSize             = 0.05;
    const contrastLimit        = 1.40;

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

