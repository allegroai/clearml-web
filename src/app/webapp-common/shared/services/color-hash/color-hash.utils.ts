import { TinyColor } from '@ctrl/tinycolor';

export const  rgbList2Hex = (rgbArray: number[]) =>
  new TinyColor({r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], ...(rgbArray.length === 4 && {a: rgbArray[3]})}).toHexString();

export const RGB2HEX = (rgbArray: number[]) => {
  if (!rgbArray) {
    return '#888888';
  }
  return '#' + rgbArray.map(x => {
    const base16 = x.toString(16);
    return (base16.length == 1) ? '0' + base16 : base16;  //Add zero if we get only one character
  }).join('');
};

export const rgba2String = (rgba: number[]) => `rgba(${rgba.join(',')})`;

export const normalizeColorToString = (color) => {
  if (typeof color === 'string') {
    return new TinyColor(color).toHexString();
  }
  if (Array.isArray(color)) {
    return rgbList2Hex(color);
  }
  return color;
};

export const hexToRgb = hex => {
  const {r, g, b} = new TinyColor(hex).toRgb();
  return [r, g, b];
};

export const invertRgb = (rgb: [number, number, number]) => rgb.map(c => 255 - c);

export function rgbToHsl(rgbArray): [number, number, number] {
  let [r, g, b] = [...rgbArray];
  r /= 255, g /= 255, b /= 255;

  const max   = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s       = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
}

export function hslToRgb(hslArray) {
  // const [h, s, l, a] = [...hslArray]; Skip this line for performance
  let r, g, b;

  if (hslArray[1] === 0) {
    r = g = b = hslArray[2]; // achromatic
  } else {
    const q = hslArray[2] < 0.5 ? hslArray[2] * (1 + hslArray[1]) : hslArray[2] + hslArray[1] - hslArray[2] * hslArray[1];
    const p = 2 * hslArray[2] - q;

    r = hue2rgb(p, q, hslArray[0] + 1 / 3);
    g = hue2rgb(p, q, hslArray[0]);
    b = hue2rgb(p, q, hslArray[0] - 1 / 3);
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255), hslArray[3] ? hslArray[3] : null];
}

export function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function getLuminanace(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getHslContrast(hsl1, hsl2): number {
  return getContrast(hslToRgb(hsl1), hslToRgb(hsl2));
}

export function getContrast(rgb1, rgb2) {
  const l1 = getLuminanace(rgb1[0], rgb1[1], rgb1[2]) + 0.05;
  const l2 = getLuminanace(rgb2[0], rgb2[1], rgb2[2]) + 0.05;
  return (Math.max(l1, l2) / Math.min(l1, l2));
}
