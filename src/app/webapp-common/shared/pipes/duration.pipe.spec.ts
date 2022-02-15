import {DurationPipe} from '@common/shared/pipes/duration.pipe';

const oneMin = 60;
const oneHour = oneMin * 60;
const oneDay = oneHour * 24;

describe('DurationPipe', () => {
  it('create an instance', () => {
    const pipe = new DurationPipe();
    expect(pipe).toBeTruthy();
  });

  it('should format days', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(3 * oneDay)).toBe('3d')
  });
  it('should format days and hours', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(3 * oneDay + 5 * oneHour)).toBe('3:05d')
  });
  it('should format days, hours and omit min', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(3 * oneDay + 5 * oneHour + 4 * oneMin)).toBe('3:05d')
  });
  it('should format days no hours with min', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(4 * oneDay + 12 * oneMin)).toBe('4d')
  });
  it('should format hours', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(5 * oneHour)).toBe('5h')
  });
  it('should format hours and min', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(5 * oneHour + 10 * oneMin)).toBe('5:10h')
  });
  it('should format hours and min omitting sec', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(5 * oneHour + 10 * oneMin + 3)).toBe('5:10h')
  });
  it('should format hours no min with secs', () => {
    const pipe = new DurationPipe();
    expect(pipe.transform(4 * oneHour + 5)).toBe('4h')
  });
});
