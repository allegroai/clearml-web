// allegro functional programming utils functions

export function addItemToList<T = any>(list: Array<T>, item: T): Array<T> {
  return list.concat([item]);
}

export function removeItemFromList<T = any>(list: Array<T>, item: T): Array<T> {
  return list.filter(arrItem => item !== arrItem);
}

export function removeItemFromListByIndex<T = any>(list: Array<T>, index: number): Array<T> {
  return list.filter((item, i) => i !== index);
}

export function updateItemFromList<T = any>(list: Array<T>, item: T, index: number): Array<T> {
  return list.map((aItem, i) => i == index ? item : aItem);
}
