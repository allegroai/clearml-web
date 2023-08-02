import * as smoothing from 'taira';

export type SmoothTypeEnum = 'runningAverage' | 'exponential' | 'gaussian' | 'any';
export const smoothTypeEnum = {
  exponential: 'Exponential Moving Average' as SmoothTypeEnum,
  runningAverage: 'Running Average' as SmoothTypeEnum,
  gaussian: 'Gaussian' as SmoothTypeEnum,
  any: 'No Smoothing' as SmoothTypeEnum
};

export const averageDebiased = (arr, weight) => {
  let last = !!arr?.length ? 0 : NaN;
  let validPoints = 0;
  return arr.map((d, i) => {
    if (!isFinite(last)) {
      return null;
    } else {
      // 1st-order IIR low-pass filter to attenuate the higher-frequency
      // components of the time-series, with bias fix toward initial value.
      last = last * weight + (1 - weight) * d;
      validPoints++;
      const debiasWeight = (i > 0 && weight < 1) ? 1 - Math.pow(weight, validPoints) : 1;
      return last / debiasWeight;
    }
  });
};

export const getSmoothedLine = (arr, weight, smoothType): number[] => {
  switch (smoothType) {
    case smoothTypeEnum.runningAverage:
      return arr.length > 5 ? smoothing.smoothen(arr, smoothing.ALGORITHMS.AVERAGE, 2, weight, false) : arr;
    case smoothTypeEnum.gaussian:
      return arr.length > 5 ? smoothing.smoothen(arr, smoothing.ALGORITHMS.GAUSSIAN, 2, Math.round(weight / 100 * 5), false) : arr;
    case smoothTypeEnum.exponential:
      return averageDebiased(arr, weight);
  }
};
