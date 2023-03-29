import {
  modelExperimentsTableFilterChanged,
  modelsExperimentsTableClearAllFilters,
  activateModelEdit, cancelModelEdit,
  editModel,
  getModelInfo,
  modelDetailsUpdated,
  resetActiveSection,
  setSavingModel,
  setModelInfo, setPlots
} from '../actions/models-info.actions';
import {TableModel} from '../shared/models.model';
import {cloneDeep} from 'lodash-es';
import {ITableExperiment} from '@common/experiments/shared/common-experiment-model.model';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {createReducer, on} from '@ngrx/store';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';

export interface ModelInfoState {
  selectedModel: TableModel;
  activeSectionEdit: boolean;
  infoDataFreeze: any;
  saving: boolean;
  modelExperiments: ITableExperiment[];
  modelExperimentsTableFilter: { [columnId: string]: FilterMetadata };
  xAxisType: ScalarKeyEnum;
  cachedAxisType: ScalarKeyEnum;
  plots: MetricsPlotEvent[];
}

const initialState: ModelInfoState = {
  selectedModel: null,
  activeSectionEdit: null,
  infoDataFreeze: null,
  saving: false,
  modelExperiments: null,
  modelExperimentsTableFilter: {},
  xAxisType: ScalarKeyEnum.Timestamp,
  cachedAxisType: null,
  plots: null
};

export const modelsInfoReducer = createReducer(
  initialState,
  on(getModelInfo, (state) => ({...state, selectedModel: null})),
  on(setModelInfo, (state, action) => ({...state, selectedModel: action.model as TableModel})),
  on(modelDetailsUpdated, (state, action) => ({
    ...state,
    selectedModel: {...state.selectedModel, ...action.changes}
  })),
  on(activateModelEdit, state =>
    ({...state, activeSectionEdit: true, infoDataFreeze: state.selectedModel})),
  on(cancelModelEdit, (state) => ({
    ...state,
    selectedModel: state.infoDataFreeze ? cloneDeep(state.infoDataFreeze) : state.selectedModel,
    activeSectionEdit: null
  })),
  on(setSavingModel, (state, action) => ({...state, saving: action.saving})),
  on(editModel, (state) => ({...state, activeSectionEdit: null})),
  on(resetActiveSection, (state) => ({...state, activeSectionEdit: null})),
  on(setPlots, (state, action) => ({...state, plots: action.plots})),
  on(modelExperimentsTableFilterChanged, (state, action) => ({
    ...state,
    modelExperimentsTableFilter: {
      ...state.modelExperimentsTableFilter,
      [action.filter.col]: {value: action.filter.value, matchMode: action.filter.filterMatchMode}
    }
  })),
  on(modelsExperimentsTableClearAllFilters, state =>
     ({...state, modelExperimentsTableFilter: initialState.modelExperimentsTableFilter,})
    )
);

