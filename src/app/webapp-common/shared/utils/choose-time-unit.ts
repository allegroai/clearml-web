export const chooseTimeUnit = (data) => {
  if (!data[0]?.x || !data[0]?.x[0] || !data[0]?.x[1]) {
    return {time: 1000, str: 'Seconds'};
  }
  const first = data[0].x[0];
  const last = data[0].x[data[0].x.length - 1];
  const seconds = Math.floor((last - first) / 1000);
  const timesConst = [12 * 30 * 24 * 60 * 60, 30 * 24 * 60 * 60, 24 * 60 * 60, 60 * 60, 60, 1];
  const timeStringPlural = ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds'];
  for (let i = 0; i < timesConst.length; i++) {
    if (seconds / timesConst[i + 1] > 100) {
      return {time: timesConst[i] * 1000, str: timeStringPlural[i]};
    }
  }
  const lastIndex = timesConst.length - 1;
  return {time: timesConst[lastIndex] * 1000, str: timeStringPlural[lastIndex]};
};
