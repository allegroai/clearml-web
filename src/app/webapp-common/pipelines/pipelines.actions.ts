import {createAction, props} from '@ngrx/store';
// import {ReportsGetAllExResponse} from '~/business-logic/model/reports/reportsGetAllExResponse';
// import {IReport} from './reports.consts';
import { Pipeline, PipelinesCompileRequest, PipelinesCreateRequest, PipelinesRunRequest, PipelinesUpdateRequest, PipelinesUpdateResponse, pipelinesSettingsModel } from '~/business-logic/model/pipelines/models';
import { PipelinesCreateStepsRequest } from '~/business-logic/model/pipelines/pipelinesCreateStepsRequest';
import { TasksGetByIdRequest } from '~/business-logic/model/tasks/models';
import { Task } from '~/business-logic/model/tasks/task';

export const PIPELINES_PREFIX = 'PIPELINES_';

export const createPipeline = createAction(
  PIPELINES_PREFIX + 'CREATE_PIPELINE',
  props<{ pipelinesCreateRequest: PipelinesCreateRequest }>()
);

export const createPipelineStep = createAction(
  PIPELINES_PREFIX + 'CREATE_PIPELINE_STEP',
  props<{ pipelinesCreateStepRequest: PipelinesCreateStepsRequest }>()
);
export const settingsPipelineAction= createAction(
  PIPELINES_PREFIX + 'SETTINGS_PIPELINE_ACTION',
  props<{ pipelinesSettingsRequest: pipelinesSettingsModel }>()
);

export const getPipelineById = createAction(
  PIPELINES_PREFIX + '[GET_PIPELINE_BY_ID]',
  props<{ id: string, name: string }>()
);

export const setSelectedPipeline = createAction(
  PIPELINES_PREFIX + '[SET_SELECTED_PIPELINE]',
  props<{ data: PipelinesUpdateResponse }>()
);


export const updatePipeline = createAction(
  PIPELINES_PREFIX + '[update pipeline]',
  props<{changes: Partial<PipelinesUpdateRequest>}>()
);
export const updatePipelineSuccess = createAction(
  PIPELINES_PREFIX + '[update pipeline success]',
  props<{changes: Partial<PipelinesUpdateResponse>}>()
);


export const compilePipeline = createAction(
  PIPELINES_PREFIX + 'COMPILE_PIPELINE',
  props<{data: Partial<PipelinesCompileRequest>}>()
);

export const runPipeline = createAction(
  PIPELINES_PREFIX + 'RUN_PIPELINE',
  props<{data: PipelinesRunRequest}>()
);

export const getExperimentById = createAction(
  PIPELINES_PREFIX + 'GET_EXPERIMENTS_BY_ID',
  props<{ getExperimentByIdRequest: TasksGetByIdRequest }>()
);

export const getAllExperiments = createAction(
  PIPELINES_PREFIX + 'GET_EXPERIMENTS',
  props<{ query: string; regExp?: boolean }>()
);


export const setExperimentsResults = createAction(
  PIPELINES_PREFIX + 'SET_EXPERIMENTS',
  props<{ experiments: Task[]}>()
);


export const getAllPipelinesPagePipelines = createAction(
  PIPELINES_PREFIX + 'GET_PIPELINES'
);
export const setPipelinesOrderBy = createAction(
  PIPELINES_PREFIX + 'SET_ORDER_BY',
  props<{orderBy: string}>()
);
export const setPipelinesSearchQuery = createAction(
  PIPELINES_PREFIX + 'SET_SEARCH_QUERY',
  props<{query: string; regExp?: boolean, skipGetAll?: boolean}>()
);
export const resetPipelinesSearchQuery = createAction(PIPELINES_PREFIX + 'RESET_SEARCH_QUERY');
export const addToPipelinesList = createAction(
  PIPELINES_PREFIX + 'ADD_TO_PIPELINES_LIST',
  props<{pipelines: Pipeline[]; reset?: boolean}>()
);
export const resetPipelines = createAction(PIPELINES_PREFIX + 'RESET_PIPELINES');

export const checkPipelineForDeletion = createAction(
  PIPELINES_PREFIX + 'CHECK_PIPELINE_FOR_DELETION',
  props<{pipeline: Pipeline}>()
);
export const resetReadyToDelete = createAction(PIPELINES_PREFIX + 'RESET_READY_TO_DELETE');

export const setNoMorePipelines = createAction(
  PIPELINES_PREFIX + 'SET_NO_MORE_PIPELINES',
  props<{payload: boolean}>()
);
export const setCurrentScrollId = createAction(
  PIPELINES_PREFIX + ' [set current scrollId]',
  props<{scrollId: string}>()
);
export const setTableModeAwareness = createAction(
  PIPELINES_PREFIX + '[set table mode awareness]',
  props<{awareness: boolean}>()
);
export const showExamplePipelines = createAction(PIPELINES_PREFIX + '[show pipelines examples]');
export const showExampleDatasets = createAction(PIPELINES_PREFIX + '[show datasets examples]');




// export const resetReports = createAction(PIPELINES_PREFIX + '[reset reports]');

// export const getReports = createAction(
//   PIPELINES_PREFIX + '[get reports]',
//   (loadMore = false) => ({loadMore})
// );

// export const getReportsTags = createAction(
//   PIPELINES_PREFIX + '[get reports tags]'
// );
// export const setReportsTags = createAction(
//   PIPELINES_PREFIX + '[set reports tags]',
//   props<{ tags: string[] }>()
// );

// export const addReportsTags = createAction(
//   PIPELINES_PREFIX + '[add reports tags]',
//   props<{ tags: string[] }>()
// );

// export const setReports = createAction(
//   PIPELINES_PREFIX + '[set reports]',
//   props<{ reports: IReport[]; scroll: ReportsGetAllExResponse['scroll_id']; noMoreReports: boolean }>()
// );

// export const addReports = createAction(
//   PIPELINES_PREFIX + '[add reports]',
//   props<{ reports: IReport[]; scroll: ReportsGetAllExResponse['scroll_id']; noMoreReports: boolean }>()
// );



// export const setReport = createAction(
//   PIPELINES_PREFIX + '[set report]',
//   props<{ report: IReport }>()
// );

// export const deleteReport = createAction(
//   PIPELINES_PREFIX + '[delete report]',
//   props<{ report: IReport }>()
// );


// export const updateReport = createAction(
//   PIPELINES_PREFIX + '[update report]',
//   props<{ id: string; changes: Partial<IReport>; refresh?: boolean }>()
// );

// export const moveReport = createAction(
//   The `setExperimentsResults` action is updating the state with a new array of experiments. It
// takes in an action containing the new array of experiments and updates the `experiments` field
// in the state with this new array.
// PIPELINES_PREFIX + '[move report]',
//   props<{ report: IReport }>()
// );

// export const navigateToProjectAfterMove = createAction(
//   PIPELINES_PREFIX + '[navigateToProjectAfterMove]',
//   props<{ projectId: string }>()
// );


// export const publishReport = createAction(
//   PIPELINES_PREFIX + '[publish report]',
//   props<{ id: string }>()
// );

// export const removeReport = createAction(
//   PIPELINES_PREFIX + '[remove report]',
//   props<{ id: string }>()
// );

// export const setReportChanges = createAction(
//   PIPELINES_PREFIX + '[set report changes]',
//   props<{ id: string; changes: Partial<IReport>; filterOut?: boolean}>()
// );

// export const setArchive = createAction(
//   PIPELINES_PREFIX + '[set archive view]',
//   props<{ archive: boolean }>()
// );

// export const archiveReport = createAction(
//   PIPELINES_PREFIX + '[archive report]',
//   props<{ report: IReport; skipUndo?: boolean }>()
// );

// export const restoreReport = createAction(
//   PIPELINES_PREFIX + '[restore report]',
//   props<{ report: IReport; skipUndo?: boolean }>()
// );
// export const setReportsOrderBy = createAction(
//   PIPELINES_PREFIX + 'SET_ORDER_BY',
//   props<{ orderBy: string }>()
// );

// export const setReportsSearchQuery = createAction(
//   PIPELINES_PREFIX + 'SET_SEARCH_QUERY',
//   props<{ query: string; regExp?: boolean }>()
// );

// export const deleteResource = createAction(
//   PIPELINES_PREFIX + 'DELETE_RESOURCE',
//   props<{resource: string}>()
// );

// export const setEditMode = createAction(
//   PIPELINES_PREFIX + 'Set Edit Mode',
//   props<{editing: boolean}>()
// );

// export const setDirty = createAction(
//   PIPELINES_PREFIX + 'Set Dirty',
//   props<{dirty: boolean}>()
// );
