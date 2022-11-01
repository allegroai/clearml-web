import * as actions from '../actions/common-experiments-info.actions';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {experimentSections, experimentSectionsEnum} from '~/features/experiments/shared/experiments.const';
import {
  activateEdit,
  deactivateEdit,
  deleteHyperParamsSection,
  experimentDataUpdated,
  experimentDetailsUpdated,
  saveExperiment,
  saveExperimentConfigObj,
  saveExperimentSection,
  saveHyperParamsSection,
  setExperiment,
  setExperimentErrors,
  setExperimentFormErrors,
  setExperimentSaving,
  setSelectedPipelineStep,
  updateExperimentAtPath,
  getExperimentArtifacts,
  resetExperimentInfo,
  setExperimentInfoData,
  updateExperimentInfoData,
  getExperimentUncommittedChanges, setExperimentUncommittedChanges, setExperimentArtifacts
} from '../actions/common-experiments-info.actions';
import {set} from 'lodash/fp';
import {setControllerForStartPipelineDialog} from '../actions/common-experiments-menu.actions';
import {createReducer, on, ReducerTypes} from '@ngrx/store';


export interface CommonExperimentInfoState {
  selectedExperiment: IExperimentInfo;
  selectedPipelineStep: IExperimentInfo;
  pipelineRunDialogTask: IExperimentInfo;
  infoData: IExperimentInfo;
  errors: { [key: string]: any } | null;
  showExtraDataSpinner: boolean;
  activeSectionEdit: boolean;
  saving: boolean;
  currentActiveSectionEdit: string;
  infoDataFreeze: IExperimentInfo;
  userKnowledge: Map<experimentSectionsEnum, boolean>;
  artifactsExperimentId: string;
}

export const initialCommonExperimentInfoState: CommonExperimentInfoState = {
  selectedExperiment: null,
  selectedPipelineStep: null,
  pipelineRunDialogTask:null,
  infoData: null,
  errors: {
    model: null,
    execution: null,
  },
  showExtraDataSpinner: false,
  activeSectionEdit: false,
  saving: false,
  currentActiveSectionEdit: null,
  infoDataFreeze: null,
  userKnowledge: {
    [experimentSections.MODEL_INPUT]: false
  } as any,
  artifactsExperimentId: null
};

export const commonExperimentInfoReducers = [
  on(setExperiment, (state, action) => ({...state, selectedExperiment: action.experiment as unknown})),
  on(setExperimentFormErrors, (state, action) => ({...state, errors: action.errors})),
  on(experimentDataUpdated, (state, action) => ({...state, infoData: {...state.infoData, ...action.changes}})),
  on(saveExperiment, saveHyperParamsSection, saveExperimentConfigObj, deleteHyperParamsSection, saveExperimentSection,
    state => ({...state, saving: true})),
  on(activateEdit, (state, action) => ({
    ...state,
    activeSectionEdit: true,
    infoDataFreeze: state.infoData,
    currentActiveSectionEdit: action.section
  })),
  on(deactivateEdit, state => ({...state, activeSectionEdit: false, currentActiveSectionEdit: null})),
  on(experimentDetailsUpdated, (state, action) => ({...state, infoData: {...state.infoData, ...action.changes}})),
  on(setExperimentSaving, (state, action) => ({...state, saving: action.saving})),
  on( setSelectedPipelineStep, (state, action) => ({...state, selectedPipelineStep: action.step})),
  on(setControllerForStartPipelineDialog, (state, action) => ({...state, pipelineRunDialogTask: action.task})),
  on(updateExperimentAtPath, (state, action) => ({...state, infoData: set(action.path, action.value, state.infoData) as any})),
  on(getExperimentArtifacts, state => ({...state, saving: false})),
  on(setExperimentErrors, (state, action) => ({...state, errors: {...state.errors, ...action}})),
  on(resetExperimentInfo, state => ({...state, infoData: null})),
  on(setExperimentInfoData, (state, action) => ({
    ...state,
    infoData: {
      ...action.experiment,
      configuration: state.infoData?.configuration,
      execution: {...action.experiment?.execution, diff: state.infoData?.execution?.diff},
      model: state.infoData?.model
    }
  })),
  on(updateExperimentInfoData, (state, action) => ({
    ...state,
    selectedExperiment: {...state.selectedExperiment, ...action.changes},
    infoData: {...state.infoData, ...action.changes}
  })),
  on(getExperimentUncommittedChanges, (state, action) => ({
    ...state,
    showExtraDataSpinner: !(action as ReturnType<typeof actions.getExperimentUncommittedChanges>).autoRefresh
  })),
  on(setExperimentUncommittedChanges, (state, action) => ({
    ...state,
    showExtraDataSpinner: false,
    infoData: {...state?.infoData, execution: {...state?.infoData?.execution, diff: action.diff}}
  })),
  on(setExperimentArtifacts, (state, action) => ({
    ...state,
    infoData: {
      ...state?.infoData,
      model :(action as ReturnType<typeof actions.setExperimentArtifacts>).model,
    },
    artifactsExperimentId: (action as ReturnType<typeof actions.setExperimentArtifacts>).experimentId
  }))
] as ReducerTypes<CommonExperimentInfoState, any>[];

export const commonExperimentInfoReducer = createReducer(
  initialCommonExperimentInfoState,
  ...commonExperimentInfoReducers
);
