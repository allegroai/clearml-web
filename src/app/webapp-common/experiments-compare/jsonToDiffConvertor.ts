import {get, has, isArray, isEqual, mergeWith, isUndefined} from 'lodash/fp';
import {IExperimentDetail} from '../../features/experiments-compare/experiments-compare-models';
import {treeBuilderService} from './services/tree-builder.service';
import {TreeNode} from './shared/experiments-compare-details.model';
import {getAlternativeConvertedExperiment, getDisplayTextForTitles} from '../../features/experiments-compare/experiment-compare-utils';
import {ConfigurationItem} from '../../business-logic/model/tasks/configurationItem';
import * as Diff from 'diff';
import {MAX_ROWS_FOR_SMART_COMPARE_ARRAYS} from './experiments-compare.constants';

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

export const mutedArray = (
  array: string[],
  changes: { [index: number]: number }
) => {
  Object.keys(changes)
    .sort((a, b) => (a > b ? -1 : 1))
    .forEach((index) => {
      const amount = changes[index];

      for (let i = 0; i < amount; i++) {
        array.splice(+index, 0, undefined);
      }
    });

  return array;
};

interface DiffArraysReturnInterface {
  base: string[];
  compared: string[];
  changes: {
    base: { [index: string]: number };
    compare: { [index: string]: number };
  };
}

export function diffArrays<T extends string[]>(compare: T, baseCompare: T): DiffArraysReturnInterface {
  const base = [];
  const compared = [];

  const diff = Diff.diffArrays(compare, baseCompare);
  const changes = {base: {}, compare: {}};

  const setLengthsAndChanges = () => {
    const baseLength = base.length;
    const comparedLength = compared.length;

    const max = Math.max(base.length, compared.length);

    base.length = max;
    compared.length = max;

    if (max - baseLength) {
      changes.base[baseLength] = max - baseLength;
    }

    if (max - comparedLength) {
      changes.compare[comparedLength] = max - comparedLength;
    }
  };

  diff.forEach((part) => {
    // added is for the base
    // remove for the compared one!
    if (!part.added && !part.removed) {
      // they are the same for both
      setLengthsAndChanges();
      base.push(...part.value);
      compared.push(...part.value);
    } else if (part.removed) {
      // only in the base
      base.push(...part.value);
    } else if (part.added) {
      // only in the compare
      compared.push(...part.value);
    }
  });

  setLengthsAndChanges();

  return {base, compared, changes};
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
  return Array.isArray(diff) ? diff.reduce((acc, curr, i) => {
    const newFileDiff = curr.startsWith('diff --git');
    if (newFileDiff) {
      currKey = curr;
      acc[curr] = [];
    } else {
      if (currKey === null) {
        if (curr.startsWith('** Content is too large to display.')) {
          acc['a_hash_'] = curr;
        } else {
          // Hope there won't be a million rows diff
          acc[`hash_${i.toString().padStart(6, '0')}`] = curr;
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
    acc[(hasInOrigin ? ' ' : '') + paramName] = value ? value.split('\n') : undefined;
    return acc;
  }, {});
}

/**
 * @description Remove undefineds from the end to start util we have defined value
 * @example removeUndefinedFromBackwardUtilValue( [
 *                                                 [1,2,3,undefined,undefined,undefined],
 *                                                 [undefined,undefined,1]
 *                                                ]) =>
 *                                                      [[1,2,3], [undefined,undefined,1]]
 */
function removeUndefinedFromBackwardUtilValue<T extends unknown[]>(_values: T[]): T[] {
  return _values.map(newValue => {
    for (let i = newValue.length - 1; i >= 0; i--) {
      if (isUndefined(newValue[i])) {
        newValue.pop();
      } else {
        return newValue;
      }
    }
    return newValue;
  });
}

/**
 * @description
 * Remove duplicated changes for specific change
 * @example removeDuplicated(
 * [
 *  {changes: {base: {1: 2, 0:1}, compare: {1: 2, 0:3}}},
 *  {changes: {base: {1: 3, 0:1}, compare: {1: 2, 0:3}}}
 * ], 'base')      =>     [
 *                          {changes: {base: {1: undefined, 0:1}        , compare: {1: 1, 0:3}}},
 *                          {changes: {base: {1: 1        , 0:undefined}, compare: {1: 1, 0:3}}}
 *                        ]
 * @param compareValues
 * @param change
 */
export function removeDuplicated<T extends DiffArraysReturnInterface>(compareValues: T[], change: 'base' | 'compare'): T[] {
  compareValues.map(c => c.changes[change]).forEach((data, index) => {
    for (let i = 0; i < compareValues.length; i++) {
      if (index !== i) {
        // make sure we are not on the same object

        Object.entries(data).forEach(([position, amount]) => {
          const _changes = compareValues[i].changes[change];

          // they are the same -> remove it from current
          if (_changes[position]) {
            if (_changes[position] === amount) {
              data[position] = 0;
            }

            // current is greater then another one -> minus them and the another one remove
            else if (_changes[position] > amount) {
              _changes[position] = _changes[position] - amount;
              data[position] = undefined;
            } else {
              //  another one is greater then current -> minus them and the current one remove
              data[position] = amount - _changes[position];
              _changes[position] = undefined;
            }
          }
        });
      }
    }
  }, []);
  return compareValues;
}

export function compareArrayOfStrings<T extends Array<string[]>>(values: T): T {
  const _values = values.map(v => v.filter(v => !isUndefined(v)));

  let mutedValues = [] as T;
  let compareValuesFromBaseToRest = [] as DiffArraysReturnInterface[];
  const compareValuesBetweenTheRest = [] as DiffArraysReturnInterface[];

  _values.forEach((experiment, index) => {
    const isNotLastIndex = index < _values.length - 1;

    // compare the base array to the rest
    if (isNotLastIndex) {
      compareValuesFromBaseToRest.push(
        diffArrays(
          _values[0],
          _values[index + 1]
        )
      );
    }

    // compare the rest of the arrays to the rest (and not the base)
    if (isNotLastIndex && index > 0) {
      compareValuesBetweenTheRest.push(
        diffArrays(
          _values[index],
          _values[index + 1]
        )
      );
    }
  });

  // remove duplicated changes if the base/compare are the same;
  compareValuesFromBaseToRest = removeDuplicated(compareValuesFromBaseToRest, 'base');
  compareValuesFromBaseToRest = removeDuplicated(compareValuesFromBaseToRest, 'compare');

  // compare base vs rest AND muted the values !!!
  compareValuesFromBaseToRest.forEach((compare, index) => {
    mutedValues[0] = mutedArray(_values[0], compare.changes.base);
    mutedValues[index + 1] = mutedArray(_values[index + 1], compare.changes.compare);
  });

  // remove unneeded undefined from the end
  mutedValues = removeUndefinedFromBackwardUtilValue(mutedValues) as T;

  // compare base vs rest the _muted_ values and muted AGAIN!
  compareValuesFromBaseToRest.forEach((_, index) => {
    const diff = diffArrays(
      mutedValues[0],
      mutedValues[index + 1]
    );
    mutedValues[0] = mutedArray(_values[0], diff.changes.base);
    mutedValues[index + 1] = mutedArray(_values[index + 1], diff.changes.compare);
  });

  // remove undefined from end to start untill we have
  return removeUndefinedFromBackwardUtilValue(mutedValues) as T;
}

export function convertConfigurationFromExperiments<T extends Array<IExperimentDetail>>(experiments: T, originalExperiments: Record<string, IExperimentDetail>): T {
  const data = experiments.map(experiment => originalExperiments[experiment.id]?.configuration?.General?.value.split('\n') || []) || [];
  if (data.some(experimentData => experimentData.length > MAX_ROWS_FOR_SMART_COMPARE_ARRAYS)) {
    return experiments;
  }
  const values = compareArrayOfStrings(data);
  experiments.forEach((experiment, index) => {
    if (' General' in experiment.configuration) {
      experiment.configuration[' General'] = values[index] as any;
    } else {
      experiment.configuration['General'] = values[index] as any;
    }
  });
  return experiments;
}

export function convertContainerScriptFromExperiments<T extends Array<IExperimentDetail>>(experiments: T, originalExperiments: Record<string, IExperimentDetail>): T {
  const data = experiments.map(experiment => originalExperiments[experiment.id]?.execution.container?.setup_shell_script);
  if (data.some(experimentData => experimentData.length > MAX_ROWS_FOR_SMART_COMPARE_ARRAYS)) {
    return experiments;
  }
  const values = compareArrayOfStrings(data);
  experiments.forEach((experiment, index) => experiment.execution.container.setup_shell_script = values[index]);
  return experiments;
}

export function convertNetworkDesignFromExperiments<T extends IExperimentDetail>(experiments: T[], originalExperiments: Record<string, IExperimentDetail>): T[] {
  const addValuesToNetworkDesign = (model: ' input models' | ' output models', key: string) => {

    const modelNetworkDesignData = experiments.map(experiment => {
      const values = (get([experiment.id, 'artifacts', model, key, 'network_design'], originalExperiments) || []);
      return Array.isArray(values) ? values : [];
    }) as Array<string[]>;

    if (modelNetworkDesignData.some(experimentData => experimentData.length > MAX_ROWS_FOR_SMART_COMPARE_ARRAYS)) {
      return experiments;
    }
    const inputModelNetworkDesignValues = compareArrayOfStrings(modelNetworkDesignData);

    experiments.forEach((experiment, index) => {
      if (experiment.artifacts[model].hasOwnProperty(key)) {
        experiment.artifacts[model][key].network_design = inputModelNetworkDesignValues[index];
      }
    });
  };

  const inputModelKeys = Array.from(new Set(Object.values(originalExperiments).map(exp => [...Object.keys(exp.artifacts[' input models'])]).flat()));
  const outputModelKeys = Array.from(new Set(Object.values(originalExperiments).map(exp => [...Object.keys(exp.artifacts[' output models'])]).flat()));
  inputModelKeys.forEach(key => addValuesToNetworkDesign(' input models', key));
  outputModelKeys.forEach(key => addValuesToNetworkDesign(' output models', key));
  return experiments;
}

export function convertExperimentsArrays(experiment, origin, experiments, path = ''): IExperimentDetail {
  const convertedExperiment: IExperimentDetail = {};
  let counter = 9999;
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
          convertedExperiment[key] = convertConfiguration(experiment[key], origin) as { [key: string]: ConfigurationItem };
          break;
        case 'setup_shell_script':
          convertedExperiment[key] = experiment[key];
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
            const currentIndex = path.split(/\.([0-9]+)$/)[1];
            experiment[key].forEach(item => {
              let convertedItemHash = convertToHashItem(item, origin && (Array.isArray(origin) ? (origin.map(item => item[key]) as any).flat() : origin[key][currentIndex]), newPath);
              if (hashedObj[convertedItemHash]) {
                convertedItemHash = `${counter}${convertedItemHash}`;
                counter--;
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
  return exp.execution?.installed_packages && !Array.isArray(exp.execution?.installed_packages);
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
