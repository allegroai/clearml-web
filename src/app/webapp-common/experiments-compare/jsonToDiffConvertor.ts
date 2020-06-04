import {get, has, isArray, isEqual, mergeWith} from 'lodash/fp';
import hoconParser from 'hocon-parser';
import hash from 'object-hash';
import {IExperimentDetail} from '../../features/experiments-compare/experiments-compare-models';
import {treeBuilderService} from './services/tree-builder.service';
import {TreeNode} from './shared/experiments-compare-details.model';

export interface TreeNodeJsonData {
  key: string;
  value: any;
  path: string;
  existOnOrigin: boolean;
  existOnCompared: boolean;
  isValueEqualToOrigin: boolean;
  isArray: boolean;
}

function arrayOrderIsNotImportant(key) {
  // List of fields with order important
  return !['augmentation', 'mapping', 'network_design', 'file content', 'preview'].includes(key);
}

function isArrayOrderNotImportant(val, key, allExperiments = []) {
  const allIsOne = allExperiments.every(experiment => experiment && experiment[key] && experiment[key].length === 1);
  return Array.isArray(val) && !allIsOne && (arrayOrderIsNotImportant(key));
}

function customMergeStrategyForArrays(objValue, srcValue, key) {
  if (isArrayOrderNotImportant(objValue, key)) {
    return objValue.concat(srcValue);
  }
}

function isObject(val) {
  return val && typeof val === 'object';
}

function isArrayOrderNotImportant2(val, key, allExperiments = []) {
  const allIsOne = allExperiments.every(experiment => experiment && experiment[key] && experiment[key].length === 1);
  return Array.isArray(val) && !allIsOne && (arrayOrderIsNotImportant(key));
}

function convertToHashItem(item, originItem) {
  const itemHash = hash(item);
  const convertedItemHash = (originItem && isArray(originItem) && originItem.map(element => hash(element)).includes(itemHash) ? 'a_hash_' : 'hash_') + itemHash;
  return convertedItemHash;
}

function convertInstalledPackages(installedPackages: string[]): { [dependecy: string]: string } {
  if (!installedPackages) {
    return {};
  }
  return Array.isArray(installedPackages) ? installedPackages.reduce((acc, curr) => {
    const [key, value] = curr.split(/ *== */);
    // TODO: What happen when duplicate key/dependency
    acc[`hash_${key}`] = `${key} : ${value || ''}`;
    return acc;
  }, {}) : installedPackages;
}

function convertnetworkDesign(networkDesign: string): any {
  if (!networkDesign) {
    return [];
  }
  if (typeof networkDesign !== 'string'){
    return networkDesign;
  }
  return networkDesign;
  // try {
  //   return hoconParser(networkDesign);
  // } catch (e) {
  //   console.log('Network design parsing error: ', e);
  //   return networkDesign;
  // }
}

function convertUncommittedChanges(diff: string[]): { [files: string]: string[] } {
  if (!diff) {
    return {};
  }
  let currKey = null;
  return Array.isArray(diff) ? diff.reduce((acc, curr) => {
    const newFileDiff = curr.startsWith('diff --git');
    if (newFileDiff) {
      currKey = curr;
      acc[curr] = [];
    } else {
      if (currKey === null) {
        acc[`hash_${curr}`] = curr;
      } else {
        acc[currKey].push(curr);
      }
    }
    return acc;
  }, {}) : diff;
}

export function convertExperimentsArrays(experiment, origin, experiments): IExperimentDetail {
  const convertedExperiment: IExperimentDetail = {};
  Object.keys(experiment).forEach(key => {
      switch (key) {
        case 'installed_packages':
          convertedExperiment[key] = convertInstalledPackages(experiment[key]);
          break;
        case 'network_design':
          convertedExperiment[key] = convertnetworkDesign(experiment[key]);
          break;
        case 'uncommitted_changes':
          convertedExperiment[key] = convertUncommittedChanges(experiment[key]);
          break;
        default:
          if (isObject(experiment[key]) && (!isArrayOrderNotImportant(experiment[key], key, experiments))) {
            convertedExperiment[key] = convertExperimentsArrays(experiment[key], origin ? origin[key] : null, experiments.map(exp => exp ? exp[key] : null));
          } else if (isArrayOrderNotImportant(experiment[key], key, experiments)) {
            const hashedObj = {};
            experiment[key].forEach(item => {
              const convertedItemHash = convertToHashItem(item, origin && origin[key]);
              if (isObject(item)) {
                hashedObj[convertedItemHash] =
                  convertExperimentsArrays(item, origin ? origin[key] : null, experiments.map(exp => exp ? exp[key] : null));
              } else {
                hashedObj[convertedItemHash] = item;
              }
            });
            convertedExperiment[key] = hashedObj;
          } else {
            convertedExperiment[key] = experiment[key];
          }
      }
    }
  );
  return convertedExperiment;
}

function abSort(obj) {
  return Object.keys(obj).sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }
  );
}

function sortObject(obj, origin, parentKey: string) {
  const orderedObj = {};
  abSort(obj).forEach(key => {
    if (isObject(obj[key]) || isArrayOrderNotImportant(obj[key], parentKey)) {
      orderedObj[key] = sortObject(obj[key], origin ? origin[key] : null, key);
    } else {
      orderedObj[key] = obj[key];
    }
  });
  return orderedObj;
}

export function getAllKeysEmptyObject(jsons) {
  let obj = {};
  jsons.forEach(json => obj = mergeWith(customMergeStrategyForArrays, obj, json));
  const sortedObject = sortObject(obj, jsons[0], '');
  return sortedObject;
}

export function createDiffObjectDetails(originObject, comparedObject, path, key): TreeNodeJsonData {
  const originData = path.length === 0 ? originObject : get(path, originObject);
  const comparedData = path.length === 0 ? comparedObject : get(path, comparedObject);
  const existOnOrigin = !!has(path, originObject);
  const existOnCompared = !!has(path, comparedObject);

  return {
    key,
    path: path.join(','),
    existOnOrigin,
    existOnCompared,
    value: comparedData,
    isValueEqualToOrigin: (originObject === comparedObject) || (isEqual(comparedData, originData) && (existOnOrigin === existOnCompared)),
    isArray: isArrayOrderNotImportant(comparedObject, key),
  };
}

export function createDiffObjectScalars(AllKeysObject, originObject?, comparedObject?, metaTransformerFunction?, originPath?): Array<TreeNode<TreeNodeJsonData>> {
  return treeBuilderService.buildTreeFromJson<TreeNodeJsonData>(AllKeysObject, (data, key, path) => {

    const originData = path.length === 0 ? originObject : get(path, originObject);
    const comparedData = path.length === 0 ? comparedObject : get(path, comparedObject);
    const originPartial = get(key, originData);
    const comparedPartial = get(key, comparedData);
    const existOnOrigin = originData && has(key, originData);
    const existOnCompared = comparedData && has(key, comparedData);

    return {
      key,
      path,
      existOnOrigin,
      existOnCompared,
      value: comparedPartial,
      isValueEqualToOrigin: isEqual(originPartial, comparedPartial) && (existOnOrigin === existOnCompared),
      isArray: isArrayOrderNotImportant(comparedPartial, key),
      originPath,
      fullPath: originPath.concat(path).concat(key)
    };
  }, metaTransformerFunction || null, {comparedObject, originPath, originObject}).children;
}
