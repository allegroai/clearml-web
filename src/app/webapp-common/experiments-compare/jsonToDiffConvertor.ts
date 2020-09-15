import {get, has, isArray, isEqual, mergeWith} from 'lodash/fp';
import {IExperimentDetail} from '../../features/experiments-compare/experiments-compare-models';
import {treeBuilderService} from './services/tree-builder.service';
import {TreeNode} from './shared/experiments-compare-details.model';
import {getAlternativeConvertedExperiment, getDisplayTextForTitles} from '../../features/experiments-compare/experiment-compare-utils';
import {ConfigurationItem} from '../../business-logic/model/tasks/configurationItem';

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


function convertToHashItem(item, originItem, path) {
  const itemHash = getDisplayTextForTitles(item, path);
  const convertedItemHash = (originItem && isArray(originItem) && originItem.map(element => getDisplayTextForTitles(element, path)).includes(itemHash) ? 'a_hash_' : 'hash_') + itemHash;
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
  if (typeof networkDesign !== 'string') {
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
        if (curr.startsWith('** Content is too large to display.')) {
          acc['a_hash_'] = curr;
        } else {
          acc[`hash_${curr}`] = curr;
        }
      } else {
        acc[currKey].push(curr);
      }
    }
    return acc;
  }, {}) : diff;
}

function convertHyperParams(hyperParams: { [section: string]: { [name: string]: any } }, originHyperParams): { [section: string]: { [name: string]: any } } {
  if (!hyperParams) {
    return {};
  }

  if (isParamsConverted(hyperParams)) {
    return hyperParams;
  }

  return Object.entries(hyperParams).reduce((result, [sectionName, section]) => {
    result[sectionName] = Object.entries(section).reduce((acc, [paramName, param]) => {
      const hasInOrigin = has(`${sectionName}.${paramName}`, originHyperParams);
      acc[(hasInOrigin ? ' ' : '') + paramName] = param.value;
      return acc;
    }, {});
    return result;
  }, {});
}

function convertConfiguration(confParams: { [name: string]: ConfigurationItem }, originConfParams): { [name: string]: string | string[] } {
  if (!confParams) {
    return {};
  }

  return Object.entries(confParams).reduce((acc, [paramName, {value}]) => {
    const hasInOrigin = has(paramName, originConfParams.configuration);
    acc[(hasInOrigin ? ' ' : '') + paramName] = value? value.split('\n'): undefined;
    return acc;
  }, {});
}

export function convertExperimentsArrays(experiment, origin, experiments, path = ''): IExperimentDetail {
  const convertedExperiment: IExperimentDetail = {};
  let counter = 1;
  Object.keys(experiment).forEach(key => {
      const newPath = `${path}.${key}`;
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
        case 'tags':
          convertedExperiment[key] = experiment[key];
          break;
        case 'configuration':
          convertedExperiment[key] = convertConfiguration(experiment[key], origin);
          break;
        default:
          const alternativeConvertedExperiment = getAlternativeConvertedExperiment(newPath, experiment[key]);
          if (alternativeConvertedExperiment) {
            convertedExperiment[key] = alternativeConvertedExperiment;
          } else if (isObject(experiment[key]) && (!isArrayOrderNotImportant(experiment[key], key, experiments))) {
            let newKey = getDisplayTextForTitles(experiment[key], newPath) || key;

            // Makes base/origin rows first
            if (origin && Array.isArray(origin) && origin.map(item => getDisplayTextForTitles(item, newPath)).includes(newKey)) {
              newKey = `0${newKey}`;
            }
            convertedExperiment[newKey] = convertExperimentsArrays(experiment[key], origin ? origin[key] : null, experiments.map(exp => exp ? exp[key] : null), newPath);
          } else if (isArrayOrderNotImportant(experiment[key], key, experiments)) {
            const hashedObj = {};
            experiment[key].forEach(item => {
              let convertedItemHash = convertToHashItem(item, origin && (Array.isArray(origin) ? (origin.map(item => item[key]) as any).flat() : origin[key]), newPath);
              if (hashedObj[convertedItemHash]) {
                convertedItemHash = `${counter}${convertedItemHash}`;
                counter++;
              }
              if (isObject(item)) {
                hashedObj[convertedItemHash] =
                  convertExperimentsArrays(item, origin ? origin[key] : null, experiments.map(exp => exp ? exp[key] : null), newPath);
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

export function convertExperimentsArraysParams(experiment, origin): IExperimentDetail {
  return Object.keys(experiment).reduce((acc, key) => {
    acc[key] = key === 'hyperparams' ? convertHyperParams(experiment[key], origin.hyperparams) : experiment[key];
    return acc;
  }, {} as IExperimentDetail);
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

export function isDetailsConverted(exp) {
  return exp.execution?.installed_packages && !Array.isArray(exp.execution?.installed_packages)
}

export function isParamsConverted(hyperparams) {
  const firstKey = hyperparams && Object.keys(hyperparams)[0];
  const firstParam = firstKey && Object.values(hyperparams[firstKey])[0];
  return typeof firstParam === 'string';
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
