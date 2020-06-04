import {ExperimentDetailBase, TreeNode} from '../../webapp-common/experiments-compare/shared/experiments-compare-details.model';
import {TreeNodeJsonData} from '../../webapp-common/experiments-compare/jsonToDiffConvertor';


export type ExperimentCompareTreeSection = TreeNode<{ data?: Array<TreeNode<TreeNodeJsonData>>; key: string}>;

export interface ExperimentCompareTree {
  model?: ExperimentCompareTreeSection;
  execution?: ExperimentCompareTreeSection;
}

export type IExperimentDetail = ExperimentDetailBase;
