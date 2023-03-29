export interface IColorHashOptions {
  lightness?: Array<number> | number;
  saturation?: Array<number> | number;
  hue?:  Array<IHue>;
}
export interface IHue {
  min: number;
  max: number;
}
