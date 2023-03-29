import tinycolor from 'tinycolor2';

export const  rgbList2Hex = (rgbArray: number[]) =>
  tinycolor({r: rgbArray[0], g: rgbArray[1], b: rgbArray[2], ...(rgbArray.length === 4 && {a: rgbArray[3]})}).toHexString();

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
    return tinycolor(color).toHexString();
  }
  if (Array.isArray(color)) {
    return rgbList2Hex(color);
  }
};

export const hexToRgb = hex => {
  const {r, g, b} = tinycolor(hex).toRgb();
  return [r, g, b];
};

export const invertRgb = (rgb: [number, number, number]) => rgb.map(c => 255 - c);
