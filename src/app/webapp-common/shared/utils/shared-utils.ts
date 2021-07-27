import {MEDIA_VIDEO_EXTENSIONS, MediaContentTypeEnum} from '../../../app.constants';
import {ActivatedRoute} from '@angular/router';
import {EXPERIMENT_GRAPH_ID_PREFIX} from '../../experiments/shared/common-experiments.const';
import {get, last} from 'lodash/fp';
import {User} from '../../../business-logic/model/users/user';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {TABLE_SORT_ORDER} from '../ui-components/data/table/table.consts';
import {CloseScrollStrategy, Overlay} from '@angular/cdk/overlay';

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const CRC_TABLE = function () {
  const polynomial = 0x04C11DB7;
  const table = new Array(256);

  const reverse = function (x, n) {  // TODO
    let b = 0;
    while (--n >= 0) {
      b <<= 1;
      b |= x & 1;
      x >>>= 1;
    }
    return b;
  };

  let i = -1;
  while (++i < 256) {
    let g = reverse(i, 32);
    let j = -1;
    while (++j < 8) {
      g = ((g << 1) ^ (((g >>> 31) & 1) * polynomial)) >>> 0;
    }
    table[i] = reverse(g, 32);
  }
  return table;
}();
export const isVideo = (contentType: MediaContentTypeEnum, uri: string) => {

  if (contentType) {
    return (contentType.indexOf('video') > -1);
  } else {
    const extension = uri && uri.split('.').pop().split('?')[0];
    return MEDIA_VIDEO_EXTENSIONS.includes(extension);
  }
};

export const isSourceVideo = (source) => {

  const contentType = (source.preview && source.preview.content_type) ? source.preview.content_type : source.content_type;
  const uri = (source.preview && source.preview.uri) ? source.preview.uri : source.uri;
  if (source.dprs) {
    return false;
  }
  return isVideo(contentType, uri);
};

export function isHtmlPage(url: string) {
  const parsed = new URL(url);
  const ext = last(parsed.pathname.split('.'));
  return ['html', 'htm'].includes(ext);
}

export function isTextFileURL(url: string) {
  const parsed = new URL(url);
  const ext = last(parsed.pathname.split('.'));
  return ['txt', 'text'].includes(ext);
}

export function createModelLink(uri, modelId, modelSignedUri) {
  const uriArray = uri.split('/');
  const filename = uriArray[uriArray.length - 1];
  const url = '/static/network?obj={"path":"' + modelSignedUri + '","fileName":"' + filename + '","id":"' + modelId + '"}';
  return encodeURI(url);
}

export function allItemsAreSelected(itemsInView: { id: any }[], selectedItems: { id: any }[]) {
  if (itemsInView?.length === 0 || selectedItems.length === 0) {
    return false;
  } else {
    const selectedItemsIds = selectedItems.map(item => item.id);
    return (itemsInView?.every(item => selectedItemsIds.includes(item.id)));
  }
}

export function addOrRemoveFromArray(arr: Array<any> = [], item) {
  if (arr.includes(item)) {
    return arr.filter(arrItem => item !== arrItem);
  } else {
    return arr.concat([item]);
  }
}

export function scrollToElement(id) {
  const element = document.getElementById(EXPERIMENT_GRAPH_ID_PREFIX + id);
  if (!element) {
    if (id) {
      console.warn('Can not find metric element: ', id);
    }
    return;
  }
  element.scrollIntoView({block: 'start', behavior: 'smooth'});
}

export function isScrolledIntoView(el) {
  const rect = el.getBoundingClientRect();
  const elemTop = rect.top;
  const elemBottom = rect.bottom;

  // Only completely visible elements return true:
  // const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
  // Partially visible elements return true:
  const isVisible = elemTop < window.innerHeight && elemBottom >= 0;
  return isVisible;
}

export function getRouteFullUrl(route: ActivatedRoute) {
  let path = route.routeConfig.path;
  while (route = route.firstChild) {
    path += '/' + route.snapshot.url.map(a => a.path).join('/');
  }
  return path;
}

export function escapeRegex(input: string) {
  return input.replace(/[.+?^*${}()|[\]\\]/g, '\\$&');
}

export function removeAlphaColor(rgbaColor: string) {
  const rgbaColorArr = rgbaColor.substring(rgbaColor.indexOf('(') + 1, rgbaColor.indexOf(')')).split(',');
  return `rgb(${rgbaColorArr[0]},${rgbaColorArr[1]},${rgbaColorArr[2]})`;
}

export function isReadOnly(item) {
  if (get('id', item) === '*') {
    return false;
  }
  return (!get('company.id', item)) || (!!get('readOnly', item));
}

export function isExample(item) {
  return item?.company && !item.company?.id;
}

export function isSharedAndNotOwner(item, activeWorkSpace: GetCurrentUserResponseUserObjectCompany): boolean {
  const isSharedandNot = item?.system_tags.includes('shared') && item?.company?.id !== activeWorkSpace?.id && (!!item?.company.id);
  return isSharedandNot;
}

export function isAnnotationTask(entity) {
  return entity.system_tags && entity.system_tags.includes('Annotation');
}

export function getCssTheme(el: HTMLElement): string {
  do {
    if (el.classList.contains('dark-theme')) {
      return 'dark-theme';
    }
    if (el.classList.contains('light-theme')) {
      return 'light-theme';
    }
    el = ((el.parentElement || el.parentNode) as HTMLElement);
  } while (el !== null && el.nodeType === 1);
  return null;
}

export function crc32(str /* , polynomial = 0x04C11DB7, initialValue = 0xFFFFFFFF, finalXORValue = 0xFFFFFFFF*/) {
  const s = String(str);
  const table = CRC_TABLE;
  const initialValue = arguments.length < 3 ? 0xFFFFFFFF : (arguments[2] >>> 0);
  const finalXORValue = arguments.length < 4 ? 0xFFFFFFFF : (arguments[3] >>> 0);
  let crc = initialValue;
  const length = s.length;
  let k = -1;
  while (++k < length) {
    const c = s.charCodeAt(k) % 255; // Modulus 255 not part of crc32, used to support non-english text. YK
    if (c > 255) {
      throw new RangeError();
    }
    const index = (crc & 255) ^ c;
    crc = ((crc >>> 8) ^ table[index]) >>> 0;
  }
  return (crc ^ finalXORValue) >>> 0;
}

export function htmlTextShorte(name: string, limit = 80) {
  if (name.length > limit) {
    return `<span title="${name}">${name.slice(0, limit - 3)}...</span>`;
  }
  return name;
}

export function findRegexRecursively(object, field: string, regex: RegExp) {
  const currentValue = get(field, object);
  if (currentValue) {
    return regex.test(currentValue);
  }
  const nodes = field.split('.');
  const node = nodes.shift();
  const nodeValue = object[node];
  if (!nodeValue) {
    return false;
  }
  if (typeof nodeValue == 'string' || typeof nodeValue == 'number') {
    return (nodes.length == 0 && typeof nodeValue == 'string') ? nodeValue.match(regex) : false;
  }
  for (const key in nodeValue) {
    const result = findRegexRecursively(nodeValue[key], nodes.join('.'), regex);
    if (result || result === null) {
      return result;
    }
  }
  return false;
}

export function groupHyperParams(hyperParams: any[]) {
  return hyperParams.reduce((acc, {section, name, value}) => {
    acc[section] = acc[section] || {};
    acc[section][name] = acc[section][name] || {};
    acc[section][name] = value;
    return acc;
  }, {});
}

export function getScaleFactor() {
  const isMac = (navigator.platform.indexOf('Mac') !== -1 || navigator.platform.indexOf('iPad') !== -1);
  const isWin = navigator.platform.indexOf('Win') !== -1;
  let dimensionRatio = 100;
  let screenHeight: number;

  try {
    if ((isWin || isMac) && (window['chrome'] || window['safari'])) {
      screenHeight = window.screen.height < window.screen.width ? window.screen.height : window.screen.width;
      dimensionRatio = Math.max(60, Math.min(100, Math.round((100 * (screenHeight / 1080) / 10)) * 10));
    }
  } catch (err) {
    dimensionRatio = 100;
  }
  dimensionRatio = 10000 / dimensionRatio;
  return dimensionRatio;
}

export function cleanUserData(user: User): User {
  return user && Object.entries(user).reduce((curr, [key, value]) => {
    if (!(value === 'Unknown' || value === '')) {
      curr[key] = value;
    }
    return curr;
  }, {});
}

export function addMultipleSortColumns(oldOrders, colId, isShift) {
  let orders;
  const currentSortField = oldOrders.find(field => field.field === colId);
  const newField = {
    field: colId,
    order: currentSortField?.order ? (currentSortField.order * -1) : TABLE_SORT_ORDER.DESC
  };

  if (isShift) {
    if (currentSortField) {
      orders = oldOrders.map(field => field.field === colId ? newField : field);
    } else {
      orders = [...oldOrders, newField];
    }
  } else {
    orders = [newField];
  }
  return orders;
}

export function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}

