import {Task} from '~/business-logic/model/tasks/task';
import {PlotData} from 'plotly.js';

export interface ExperimentGraph {
  data?: unknown;
  layout?: {[key: string]: unknown};
  iter?: number;
  metric?: string;
  task?: Task['id'];
  timestamp?: number;
  type?: string;  // TODO: write options in constant
  variant?: string;
  worker?: string;
  config?: {[key: string]: unknown};
}

export interface GroupedList {
  [metric: string]: { [variant: string]: { [experimentId: string]: PlotData } };
}
