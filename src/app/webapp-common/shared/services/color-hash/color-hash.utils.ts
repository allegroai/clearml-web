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
  let [h, s, l, a] = [...hslArray];
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {


    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255), a ? a : null];
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


/**
 * Convert RGB Array to HEX
 *
 * @param {Array} RGBArray - [R, G, B]
 * @returns {String} 6 digits hex starting with #
 */
export function RGB2HEX(RGBArray) {
  if (!RGBArray) {
    return '#888888';
  }
  return '#' + RGBArray.map(function (x) {             //For each array element
    x = parseInt(x).toString(16);      //Convert to a base16 string
    return (x.length == 1) ? '0' + x : x;  //Add zero if we get only one character
  }).join('');
}

/**
 * Convert HSL to RGB
 *
 * @see {@link http://zh.wikipedia.org/wiki/HSL和HSV色彩空间} for further information.
 * @param {Number} H Hue ∈ [0, 360)
 * @param {Number} S Saturation ∈ [0, 1]
 * @param {Number} L Lightness ∈ [0, 1]
 * @returns {Array} R, G, B ∈ [0, 255]
 */
export function HSL2RGB(H, S, L) {
  H /= 360;

  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;

  return [H + 1 / 3, H, H - 1 / 3].map(function (color) {
    if (color < 0) {
      color++;
    }
    if (color > 1) {
      color--;
    }
    if (color < 1 / 6) {
      color = p + (q - p) * 6 * color;
    } else if (color < 0.5) {
      color = q;
    } else if (color < 2 / 3) {
      color = p + (q - p) * 6 * (2 / 3 - color);
    } else {
      color = p;
    }
    return Math.round(color * 255);
  });
}

export function hexToRgb(hex) {
  hex          = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r      = (bigint >> 16) & 255;
  const g      = (bigint >> 8) & 255;
  const b      = bigint & 255;

  return [r, g, b];
}

export function invertRgb(rgb: [number, number, number]) {
  return rgb.map(c => 255 - c);
}
