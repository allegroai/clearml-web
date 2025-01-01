import {Task} from '~/business-logic/model/tasks/task';
import {PlotData} from 'plotly.js';

export interface ExperimentGraph {
  data?: unknown;
  layout?: Record<string, unknown>;
  iter?: number;
  metric?: string;
  task?: Task['id'];
  timestamp?: number;
  type?: string;
  variant?: string;
  worker?: string;
  config?: Record<string, unknown>;
}

export type GroupedList = Record<string, Record<string, PlotData>>;
